const test = require('node:test');
const assert = require('node:assert/strict');
const { zipSync, strToU8 } = require('fflate');
const {
  MAX_TEXT_CHARS,
  DocumentError,
  extractDocument,
  hasExpectedSignature,
} = require('../services/documents');

// A hand-built single-page PDF with a real text object, so the PDF path is
// tested without a network call or a binary fixture in the repository.
function buildPdf(text) {
  const content = `BT /F1 18 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

async function expectDocumentError(promise, code, status) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof DocumentError);
    assert.equal(error.code, code);
    assert.equal(error.status, status);
    return true;
  });
}

test('a UTF-8 text file is decoded', async () => {
  const result = await extractDocument({
    originalname: 'notes.md',
    buffer: Buffer.from('# Cells\n\nMitochondria make energy.'),
  });

  assert.equal(result.kind, 'text');
  assert.equal(result.needsVision, false);
  assert.equal(result.text, '# Cells\n\nMitochondria make energy.');
});

test('a long document is truncated and reported', async () => {
  const result = await extractDocument({
    originalname: 'notes.txt',
    buffer: Buffer.from('a'.repeat(MAX_TEXT_CHARS + 500)),
  });

  assert.equal(result.truncated, true);
  assert.equal(result.text.length, MAX_TEXT_CHARS);
});

test('invalid UTF-8 text is rejected', async () => {
  await expectDocumentError(
    extractDocument({
      originalname: 'notes.txt',
      buffer: Buffer.from([0xff, 0xfe, 0xfd]),
    }),
    'invalid_text',
    422
  );
});

test('text containing NUL bytes is rejected as binary', async () => {
  await expectDocumentError(
    extractDocument({
      originalname: 'notes.txt',
      buffer: Buffer.from('hello\u0000world'),
    }),
    'invalid_text',
    422
  );
});

test('an unsupported extension is rejected', async () => {
  await expectDocumentError(
    extractDocument({ originalname: 'file.zip', buffer: Buffer.from('PK\u0003\u0004') }),
    'unsupported_type',
    415
  );
});

test('the signature must match the extension', async () => {
  await expectDocumentError(
    extractDocument({ originalname: 'scan.png', buffer: Buffer.from('plain text') }),
    'spoofed_type',
    400
  );
});

test('DOCX text runs and paragraphs are extracted', async () => {
  const buffer = Buffer.from(
    zipSync({
      'word/document.xml': strToU8(
        '<w:document><w:body>' +
          '<w:p><w:r><w:t>Cell biology</w:t></w:r></w:p>' +
          '<w:p><w:r><w:t>Mitochondria &amp; energy</w:t></w:r></w:p>' +
          '</w:body></w:document>'
      ),
    })
  );

  const result = await extractDocument({ originalname: 'cells.docx', buffer });

  assert.equal(result.kind, 'docx');
  assert.equal(result.text, 'Cell biology\nMitochondria & energy');
});

test('PPTX slides are extracted in order', async () => {
  const buffer = Buffer.from(
    zipSync({
      'ppt/slides/slide2.xml': strToU8(
        '<p:sld><a:p><a:r><a:t>Second slide</a:t></a:r></a:p></p:sld>'
      ),
      'ppt/slides/slide1.xml': strToU8(
        '<p:sld><a:p><a:r><a:t>First slide</a:t></a:r></a:p></p:sld>'
      ),
    })
  );

  const result = await extractDocument({ originalname: 'deck.pptx', buffer });

  assert.equal(result.kind, 'pptx');
  assert.equal(result.text, 'First slide\n\nSecond slide');
});

test('a ZIP that is not a DOCX is rejected', async () => {
  const buffer = Buffer.from(zipSync({ 'other/file.xml': strToU8('<x />') }));

  await expectDocumentError(
    extractDocument({ originalname: 'fake.docx', buffer }),
    'invalid_archive',
    422
  );
});

test('an image is sent to the vision path without text extraction', async () => {
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.alloc(32),
  ]);

  const result = await extractDocument({ originalname: 'scan.png', buffer: png });

  assert.equal(result.kind, 'image');
  assert.equal(result.needsVision, true);
  assert.equal(result.text, '');
  assert.equal(result.mimeType, 'image/png');
});

test('PDF text is extracted and page count is returned', async () => {
  const result = await extractDocument({
    originalname: 'notes.pdf',
    buffer: buildPdf('Cell respiration releases energy'),
  });

  assert.equal(result.kind, 'pdf');
  assert.equal(result.pageCount, 1);
  assert.equal(result.needsVision, false);
  assert.match(result.text, /Cell respiration releases energy/);
});

test('a malformed PDF is rejected', async () => {
  await expectDocumentError(
    extractDocument({
      originalname: 'broken.pdf',
      buffer: Buffer.from('%PDF-1.4\nnot really a pdf'),
    }),
    'invalid_pdf',
    422
  );
});

test('signature helpers accept the supported formats', () => {
  assert.equal(hasExpectedSignature('pdf', Buffer.from('%PDF-1.7')), true);
  assert.equal(hasExpectedSignature('docx', Buffer.from('PK\u0003\u0004')), true);
  assert.equal(hasExpectedSignature('image', Buffer.from([0xff, 0xd8, 0xff, 0xe0])), true);
  assert.equal(
    hasExpectedSignature('image', Buffer.from('RIFF1234WEBP')),
    true
  );
  assert.equal(hasExpectedSignature('pdf', Buffer.from('GIF89a')), false);
});

const path = require('node:path');
const { unzipSync } = require('fflate');

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 16000;
const MAX_PDF_PAGES = 60;
const MAX_SLIDES = 100;
const MIN_PDF_TEXT_CHARS = 10;
const MAX_UNZIPPED_BYTES = 32 * 1024 * 1024;
const PDF_TIMEOUT_MS = 25000;
const SUPPORTED_MESSAGE =
  'Choose a PDF, DOCX, PPTX, TXT, MD, CSV, PNG, JPG or WEBP file.';

const TYPES = new Map([
  ['.pdf', { kind: 'pdf', label: 'PDF', mimeType: 'application/pdf' }],
  [
    '.docx',
    {
      kind: 'docx',
      label: 'DOCX',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  ],
  [
    '.pptx',
    {
      kind: 'pptx',
      label: 'PPTX',
      mimeType:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },
  ],
  ['.txt', { kind: 'text', label: 'TXT', mimeType: 'text/plain' }],
  ['.md', { kind: 'text', label: 'MD', mimeType: 'text/markdown' }],
  ['.csv', { kind: 'text', label: 'CSV', mimeType: 'text/csv' }],
  ['.png', { kind: 'image', label: 'PNG', mimeType: 'image/png' }],
  ['.jpg', { kind: 'image', label: 'JPG', mimeType: 'image/jpeg' }],
  ['.jpeg', { kind: 'image', label: 'JPG', mimeType: 'image/jpeg' }],
  ['.webp', { kind: 'image', label: 'WEBP', mimeType: 'image/webp' }],
]);

class DocumentError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'DocumentError';
    this.code = code;
    this.status = status;
  }
}

function startsWith(buffer, bytes, offset = 0) {
  if (buffer.length < offset + bytes.length) {
    return false;
  }

  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

// Signature checks are the real type check. The browser-supplied MIME type and
// the file name are both untrusted, so the bytes have to agree with them.
function hasExpectedSignature(kind, buffer) {
  switch (kind) {
    case 'pdf':
      return startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d]);
    case 'docx':
    case 'pptx':
      return startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]);
    case 'image':
      return (
        startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) ||
        startsWith(buffer, [0xff, 0xd8, 0xff]) ||
        (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
          startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8))
      );
    default:
      return true;
  }
}

function decodeXmlEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function xmlToText(xml, { paragraphEnd, cellEnd, tabTag, breakTag }) {
  let text = xml
    .replace(breakTag, '\n')
    .replace(tabTag, '\t')
    .replace(paragraphEnd, '\n')
    .replace(cellEnd, '\t')
    .replace(/<[^>]*>/g, '');

  text = decodeXmlEntities(text);

  return text;
}

function readZipEntry(parts, name) {
  const entry = parts[name];

  if (!entry) {
    throw new DocumentError(
      'invalid_archive',
      'That file could not be read. It may be damaged or incomplete.',
      422
    );
  }

  return new TextDecoder('utf-8', { fatal: false }).decode(entry);
}

function unzipXml(buffer, accepts) {
  let parts;
  let unpackedBytes = 0;

  try {
    parts = unzipSync(new Uint8Array(buffer), {
      filter(file) {
        if (!accepts(file.name)) {
          return false;
        }

        unpackedBytes += file.originalSize;

        if (file.originalSize > MAX_UNZIPPED_BYTES || unpackedBytes > MAX_UNZIPPED_BYTES) {
          throw new DocumentError(
            'archive_too_large',
            'That file expands to too much data to read safely.',
            422
          );
        }

        return true;
      },
    });
  } catch (error) {
    if (error instanceof DocumentError) {
      throw error;
    }

    throw new DocumentError(
      'invalid_archive',
      'That file could not be read. It may be damaged or incomplete.',
      422
    );
  }

  return parts;
}

function extractDocxText(buffer) {
  const parts = unzipXml(buffer, (name) => name === 'word/document.xml');
  const xml = readZipEntry(parts, 'word/document.xml');

  return xmlToText(xml, {
    paragraphEnd: /<\/w:p>/g,
    cellEnd: /<\/w:tc>/g,
    tabTag: /<w:tab\b[^>]*\/>/g,
    breakTag: /<w:br\b[^>]*\/>/g,
  });
}

function extractPptxText(buffer) {
  const slideNames = [];
  const parts = unzipXml(buffer, (name) => {
    if (/^ppt\/slides\/slide\d+\.xml$/.test(name)) {
      slideNames.push(name);
      return true;
    }

    return false;
  });

  slideNames.sort((a, b) => {
    const aNumber = Number(a.match(/slide(\d+)\.xml/)[1]);
    const bNumber = Number(b.match(/slide(\d+)\.xml/)[1]);
    return aNumber - bNumber;
  });

  if (slideNames.length === 0) {
    throw new DocumentError(
      'invalid_archive',
      'That file does not contain any slides.',
      422
    );
  }

  if (slideNames.length > MAX_SLIDES) {
    throw new DocumentError(
      'too_many_slides',
      `Presentations with more than ${MAX_SLIDES} slides are not supported yet.`,
      422
    );
  }

  return slideNames
    .map((name) =>
      xmlToText(readZipEntry(parts, name), {
        paragraphEnd: /<\/a:p>/g,
        cellEnd: /<\/a:tc>/g,
        tabTag: /<a:tab\b[^>]*\/>/g,
        breakTag: /<a:br\b[^>]*\/>/g,
      })
    )
    .join('\n\n');
}

function decodePlainText(buffer) {
  let text;

  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    throw new DocumentError(
      'invalid_text',
      'That file is not valid UTF-8 text. Save it as UTF-8 and try again.',
      422
    );
  }

  if (text.includes('\u0000')) {
    throw new DocumentError(
      'invalid_text',
      'That file contains binary data, not readable text.',
      422
    );
  }

  return text;
}

function withTimeout(promise, ms, message) {
  let timer;

  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      reject(new DocumentError('extraction_timeout', message, 422));
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function extractPdfText(buffer) {
  let pdf;

  try {
    const { getDocumentProxy } = require('unpdf');
    pdf = await getDocumentProxy(new Uint8Array(buffer));
  } catch (error) {
    const name = String(error?.name || '');

    if (name.includes('Password')) {
      throw new DocumentError(
        'password_protected',
        'That PDF is password protected. Remove the password and try again.',
        422
      );
    }

    throw new DocumentError(
      'invalid_pdf',
      'That PDF could not be read. It may be damaged.',
      422
    );
  }

  try {
    if (pdf.numPages > MAX_PDF_PAGES) {
      throw new DocumentError(
        'too_many_pages',
        `PDFs with more than ${MAX_PDF_PAGES} pages are not supported yet.`,
        422
      );
    }

    const { extractText } = require('unpdf');
    const result = await withTimeout(
      extractText(pdf, { mergePages: true }),
      PDF_TIMEOUT_MS,
      'That PDF took too long to read. Try a smaller document.'
    );

    return { text: result.text, pageCount: pdf.numPages };
  } finally {
    await pdf.destroy?.();
  }
}

function cleanText(raw) {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function limitText(text) {
  if (text.length <= MAX_TEXT_CHARS) {
    return { text, truncated: false };
  }

  return { text: text.slice(0, MAX_TEXT_CHARS).trimEnd(), truncated: true };
}

async function extractDocument({ originalname, buffer }) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new DocumentError('empty_file', 'Choose a file to summarize.');
  }

  if (buffer.length > MAX_FILE_BYTES) {
    throw new DocumentError('file_too_large', 'That file is larger than 10 MB.', 413);
  }

  const extension = path.extname(String(originalname || '')).toLowerCase();
  const type = TYPES.get(extension);

  if (!type) {
    throw new DocumentError('unsupported_type', SUPPORTED_MESSAGE, 415);
  }

  if (!hasExpectedSignature(type.kind, buffer)) {
    throw new DocumentError(
      'spoofed_type',
      `That file does not contain valid ${type.label} data.`,
      400
    );
  }

  if (type.kind === 'image') {
    return {
      kind: 'image',
      mimeType: type.mimeType,
      text: '',
      truncated: false,
      pageCount: null,
      needsVision: true,
    };
  }

  let rawText;
  let pageCount = null;

  if (type.kind === 'pdf') {
    const pdfResult = await extractPdfText(buffer);
    rawText = pdfResult.text;
    pageCount = pdfResult.pageCount;
  } else if (type.kind === 'docx') {
    rawText = extractDocxText(buffer);
  } else if (type.kind === 'pptx') {
    rawText = extractPptxText(buffer);
  } else {
    rawText = decodePlainText(buffer);
  }

  const cleaned = cleanText(rawText);
  const limited = limitText(cleaned);
  const needsVision = type.kind === 'pdf' && limited.text.length < MIN_PDF_TEXT_CHARS;

  if (!needsVision && limited.text.length === 0) {
    throw new DocumentError('empty_document', 'That document has no readable text.', 422);
  }

  return {
    kind: type.kind,
    mimeType: type.mimeType,
    text: needsVision ? '' : limited.text,
    truncated: needsVision ? false : limited.truncated,
    pageCount,
    needsVision,
  };
}

module.exports = {
  MAX_FILE_BYTES,
  MAX_TEXT_CHARS,
  MAX_UNZIPPED_BYTES,
  DocumentError,
  extractDocument,
  // Exported for unit tests.
  hasExpectedSignature,
};

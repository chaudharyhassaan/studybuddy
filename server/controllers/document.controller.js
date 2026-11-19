const env = require('../config/env');
const { DocumentError, extractDocument } = require('../services/documents');
const { summarizeDocument } = require('../services/ai');
const { consumeAiBudget, AI_LIMIT_MESSAGE } = require('../services/aiBudget');

const SUMMARY_FAILED_MESSAGE = 'Document summary failed. Try again.';
const VISION_UNAVAILABLE_MESSAGE =
  'Images and scanned PDFs cannot be summarized right now. Try a text-based document.';

function fail(res, status, message) {
  return res.status(status).json({ error: { message } });
}

async function summarize(req, res, next) {
  if (!req.file) {
    return fail(res, 400, 'Choose a document to summarize.');
  }

  try {
    let document;

    try {
      document = await extractDocument(req.file);
    } catch (error) {
      if (error instanceof DocumentError) {
        return fail(res, error.status, error.message);
      }

      throw error;
    }

    if (document.needsVision && !env.geminiApiKey) {
      return fail(res, 422, VISION_UNAVAILABLE_MESSAGE);
    }

    const budget = consumeAiBudget(req.user._id);

    if (!budget.allowed) {
      return fail(res, 429, AI_LIMIT_MESSAGE);
    }

    let summary;

    try {
      summary = await summarizeDocument({
        instruction: req.body.prompt,
        text: document.text,
        attachment: document.needsVision
          ? { mimeType: document.mimeType, data: req.file.buffer }
          : null,
      });
    } catch {
      // Provider errors and invalid model output are never sent to the client.
      return fail(res, 502, SUMMARY_FAILED_MESSAGE);
    }

    return res.json({
      summary,
      truncated: document.truncated,
      pageCount: document.pageCount,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { summarize };

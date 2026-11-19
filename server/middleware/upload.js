const multer = require('multer');
const { MAX_FILE_BYTES } = require('../services/documents');

// Files stay in memory: Render's disk is temporary and nothing is stored.
// The route accepts one file field and a short prompt field only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_BYTES,
    files: 1,
    fields: 2,
    fieldSize: 2000,
    parts: 4,
  },
});

module.exports = { upload };

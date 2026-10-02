const fs = require('fs');
const path = require('path');

// Where uploaded cover images are stored and the URL prefix they are served from
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'));
const UPLOAD_URL_PREFIX = '/uploads/';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Delete a previously uploaded image (ignores external URLs and missing files)
const removeUploadedImage = async (url) => {
    if (typeof url !== 'string' || !url.startsWith(UPLOAD_URL_PREFIX)) return;
    const file = path.join(UPLOAD_DIR, path.basename(url));
    await fs.promises.unlink(file).catch(() => {});
};

module.exports = { UPLOAD_DIR, UPLOAD_URL_PREFIX, removeUploadedImage };

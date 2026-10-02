const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { UPLOAD_DIR, UPLOAD_URL_PREFIX } = require('../config/uploads');

const MAX_SIZE_MB = 2;

// Recognise images by their first bytes, not by the name or type the browser sends.
// SVG is deliberately not allowed because it can contain scripts.
const detectImageType = (buffer) => {
    if (buffer.length < 12) return null;
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
    if (buffer.subarray(0, 4).toString('ascii') === 'GIF8') return 'gif';
    if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
    return null;
};

// Keep the file in memory until its contents have been checked
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 1 },
}).single('image');

// Accept one image in the "image" form field and return its URL
const uploadImage = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            const message = err.code === 'LIMIT_FILE_SIZE' ? `Images must be ${MAX_SIZE_MB} MB or smaller.` : 'Please upload a single file in the "image" field.';
            return res.status(400).json({ success: false, message });
        }
        if (err) return next(err);
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please choose an image to upload.' });
        }
        const extension = detectImageType(req.file.buffer);
        if (!extension) {
            return res.status(400).json({ success: false, message: 'Only JPEG, PNG, GIF and WebP images are allowed.' });
        }
        try {
            // A random name, so uploads can't overwrite each other or choose their own path
            const filename = `${crypto.randomBytes(16).toString('hex')}.${extension}`;
            await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), req.file.buffer);
            res.status(201).json({ success: true, message: 'Image uploaded.', data: { url: `${UPLOAD_URL_PREFIX}${filename}` } });
        } catch (writeErr) {
            next(writeErr);
        }
    });
};

module.exports = { uploadImage };

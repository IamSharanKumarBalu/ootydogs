const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ErrorHandler = require('./errorHandler');

// Base directory for uploads — use env var on server, local fallback for dev
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');

// Base URL served by Nginx — set SERVER_URL in config.env on the VPS
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';

function ensureDir(folder) {
    const dir = path.join(UPLOADS_DIR, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

function base64ToBuffer(base64String) {
    // Strip data:image/jpeg;base64, prefix if present
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (matches) return { ext: matches[1].split('/')[1] || 'jpg', buffer: Buffer.from(matches[2], 'base64') };
    return { ext: 'jpg', buffer: Buffer.from(base64String, 'base64') };
}

/**
 * Drop-in replacement for cloudinary.v2.uploader.upload(base64, { folder })
 * Returns { public_id, secure_url } to match cloudinary's response shape.
 */
async function upload(base64String, options = {}) {
    if (!base64String) throw new ErrorHandler('No file data provided', 400);
    try {
        const folder = options.folder || 'misc';
        const dir = ensureDir(folder);
        const { ext, buffer } = base64ToBuffer(base64String);
        const filename = `${uuidv4()}.${ext}`;
        const filepath = path.join(dir, filename);
        fs.writeFileSync(filepath, buffer);
        const public_id = `${folder}/${filename}`;
        const secure_url = `${SERVER_URL}/uploads/${public_id}`;
        return { public_id, secure_url };
    } catch (err) {
        if (err.statusCode) throw err;
        throw new ErrorHandler(`File upload failed: ${err.message}`, 500);
    }
}

/**
 * Drop-in replacement for cloudinary.v2.uploader.destroy(public_id)
 * public_id is stored as "folder/filename.ext"
 */
async function destroy(public_id) {
    if (!public_id) return;
    const filepath = path.join(UPLOADS_DIR, public_id);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
}

module.exports = { upload, destroy };

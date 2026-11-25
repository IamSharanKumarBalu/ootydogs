const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64 string or data URI to Cloudinary.
 * Returns { public_id, secure_url } — same shape as before.
 */
async function upload(base64String, options = {}) {
    const folder = options.folder || 'misc';
    const result = await cloudinary.uploader.upload(base64String, {
        folder,
        resource_type: 'auto',
    });
    return { public_id: result.public_id, secure_url: result.secure_url };
}

/**
 * Delete an asset from Cloudinary by its public_id.
 */
async function destroy(public_id) {
    if (!public_id) return;
    await cloudinary.uploader.destroy(public_id, { resource_type: 'auto' });
}

module.exports = { upload, destroy };

const cloudinary = require('cloudinary').v2;

// True only when all three Cloudinary env vars are actually set — used to
// decide (server-side only) whether to upload to Cloudinary or fall back to
// local disk storage, same pattern as the Razorpay demo-mode detection.
const isCloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Uploads a buffer (from multer's memory storage) to Cloudinary and
// resolves with the resulting secure (https) URL.
const uploadBufferToCloudinary = (buffer, folder = 'pizza-app/inventory') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

module.exports = { isCloudinaryConfigured, uploadBufferToCloudinary };

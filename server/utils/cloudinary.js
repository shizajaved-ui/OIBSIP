const cloudinary = require('cloudinary').v2;

// The Cloudinary SDK automatically picks up CLOUDINARY_URL from process.env if present.
// If individual keys are provided instead, we configure it manually.
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Uploads an image buffer to Cloudinary and returns the secure URL.
 */
const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    // Convert buffer to base64 for reliable transport
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    cloudinary.uploader.upload(
      base64Image,
      {
        resource_type: 'image',
        folder: 'pizza-app/inventory'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
  });

module.exports = { isCloudinaryConfigured, uploadBufferToCloudinary };

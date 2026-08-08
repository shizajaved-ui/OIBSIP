const cloudinary = require('cloudinary').v2;

// The Cloudinary SDK automatically picks up CLOUDINARY_URL from process.env if present.
// We just need to check if it's there to enable/disable features in the app.
const isCloudinaryConfigured = !!(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_API_KEY);

if (isCloudinaryConfigured) {
  cloudinary.config({ secure: true });
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

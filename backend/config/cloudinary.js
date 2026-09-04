const cloudinary = require('cloudinary').v2;
const streamifier = require('stream');

// Configure Cloudinary credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Check if Cloudinary credentials are fully configured
 */
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name'
  );
};

/**
 * Upload a file buffer directly to Cloudinary using streams
 * @param {Buffer} buffer - File buffer from memory storage
 * @param {Object} options - Cloudinary upload options (folder, resource_type, public_id, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'rojgar',
        resource_type: options.resource_type || 'auto',
        public_id: options.public_id,
        overwrite: options.overwrite || true,
        transformation: options.transformation,
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    const readableStream = new streamifier.Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete an asset from Cloudinary
 * @param {string} publicId - Public ID of the asset
 * @param {string} resourceType - 'image' | 'raw' | 'video'
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!isCloudinaryConfigured() || !publicId) return null;
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};

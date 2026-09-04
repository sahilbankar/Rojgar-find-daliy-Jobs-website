const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
} = require('../config/cloudinary');

// Ensure local upload fallback directories exist
const uploadDirs = ['resumes', 'images'];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, `../uploads/${dir}`);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Memory storage to hold file buffer for Cloudinary or fallback processing
const memoryStorage = multer.memoryStorage();

// File filter for resumes
const resumeFileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|doc|docx/;
  const allowedMimeTypes =
    /application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/;

  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF or Word documents (.pdf, .doc, .docx) are allowed.'), false);
  }
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const allowedMimeTypes = /image\/jpeg|image\/jpg|image\/png|image\/webp/;

  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed.'), false);
  }
};

const multerResume = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: resumeFileFilter,
});

const multerImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
  fileFilter: imageFileFilter,
});

/**
 * Middleware wrapper to handle Cloudinary upload with local disk fallback for Resumes
 */
const uploadResumeSingle = (fieldName = 'resume') => {
  const upload = multerResume.single(fieldName);

  return (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res
            .status(400)
            .json({ message: 'Resume file size must be less than 5MB.' });
        }
        return res
          .status(400)
          .json({ message: err.message || 'Failed to upload resume file.' });
      }

      if (!req.file) {
        return next();
      }

      try {
        const userId = req.user ? req.user.id : 'anonymous';
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        if (isCloudinaryConfigured()) {
          // Upload to Cloudinary folder rojgar/resumes
          const result = await uploadBufferToCloudinary(req.file.buffer, {
            folder: 'rojgar/resumes',
            resource_type: 'auto',
            public_id: `resume-${userId}-${Date.now()}`,
          });

          req.file.secure_url = result.secure_url;
          req.file.path = result.secure_url;
          req.file.public_id = result.public_id;
        } else {
          // Fallback: save to local disk
          const filename = `resume-${userId}-${Date.now()}${fileExt}`;
          const diskPath = path.join(__dirname, '../uploads/resumes', filename);
          fs.writeFileSync(diskPath, req.file.buffer);

          const relativeUrl = `/uploads/resumes/${filename}`;
          req.file.filename = filename;
          req.file.secure_url = relativeUrl;
          req.file.path = relativeUrl;
        }

        next();
      } catch (uploadError) {
        console.error('Resume Cloudinary/Storage Upload Error:', uploadError);
        return res
          .status(500)
          .json({ message: 'Failed to process and store resume file.' });
      }
    });
  };
};

/**
 * Middleware wrapper to handle Cloudinary upload with local disk fallback for Images
 */
const uploadImageSingle = (fieldName = 'avatar') => {
  const upload = multerImage.single(fieldName);

  return (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res
            .status(400)
            .json({ message: 'Image size must be less than 2MB.' });
        }
        return res
          .status(400)
          .json({ message: err.message || 'Failed to upload image file.' });
      }

      if (!req.file) {
        return next();
      }

      try {
        const userId = req.user ? req.user.id : 'anonymous';
        const isLogo =
          fieldName === 'logo' ||
          (req.baseUrl && req.baseUrl.includes('employer'));
        const folder = isLogo ? 'rojgar/logos' : 'rojgar/avatars';
        const prefix = isLogo ? 'logo' : 'avatar';
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        if (isCloudinaryConfigured()) {
          // Upload to Cloudinary with automatic optimization
          const result = await uploadBufferToCloudinary(req.file.buffer, {
            folder,
            resource_type: 'image',
            public_id: `${prefix}-${userId}-${Date.now()}`,
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          });

          req.file.secure_url = result.secure_url;
          req.file.path = result.secure_url;
          req.file.public_id = result.public_id;
        } else {
          // Fallback: save to local disk
          const filename = `${prefix}-${userId}-${Date.now()}${fileExt}`;
          const diskPath = path.join(__dirname, '../uploads/images', filename);
          fs.writeFileSync(diskPath, req.file.buffer);

          const relativeUrl = `/uploads/images/${filename}`;
          req.file.filename = filename;
          req.file.secure_url = relativeUrl;
          req.file.path = relativeUrl;
        }

        next();
      } catch (uploadError) {
        console.error('Image Cloudinary/Storage Upload Error:', uploadError);
        return res
          .status(500)
          .json({ message: 'Failed to process and store image file.' });
      }
    });
  };
};

module.exports = {
  uploadResume: {
    single: (name = 'resume') => uploadResumeSingle(name),
  },
  uploadImage: {
    single: (name = 'avatar') => uploadImageSingle(name),
  },
  uploadResumeSingle,
  uploadImageSingle,
};

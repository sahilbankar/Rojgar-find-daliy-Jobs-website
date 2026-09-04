const User = require('../models/User');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/me
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, skills, availabilityStatus, phone, location, experience } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (skills !== undefined) user.skills = skills;
    if (availabilityStatus !== undefined) user.availabilityStatus = availabilityStatus;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (experience !== undefined) user.experience = experience;
    if (req.body.education !== undefined) user.education = req.body.education;

    if (req.body.email !== undefined && req.body.email.trim() !== '') {
      const email = req.body.email.trim().toLowerCase();
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
      user.email = email;
    }

    if (req.body.password && req.body.password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume
// @route   POST /api/users/me/resume
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume file' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resumeUrl =
      req.file.secure_url ||
      req.file.path ||
      (req.file.filename ? `/uploads/resumes/${req.file.filename}` : null);

    if (!resumeUrl) {
      return res.status(500).json({ message: 'Failed to process resume URL' });
    }

    // Clean up previous Cloudinary resume asset if replacing
    if (user.resumePublicId && req.file.public_id && user.resumePublicId !== req.file.public_id) {
      await deleteFromCloudinary(user.resumePublicId, 'raw');
    }

    user.resumeUrl = resumeUrl;
    if (req.file.public_id) {
      user.resumePublicId = req.file.public_id;
    }
    await user.save();

    const cleanUser = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: cleanUser,
      user: cleanUser,
      resumeUrl,
      message: 'Resume uploaded successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/me/avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const avatarUrl =
      req.file.secure_url ||
      req.file.path ||
      (req.file.filename ? `/uploads/images/${req.file.filename}` : null);

    if (!avatarUrl) {
      return res.status(500).json({ message: 'Failed to process avatar image URL' });
    }

    // Clean up previous Cloudinary avatar asset if replacing
    if (user.avatarPublicId && req.file.public_id && user.avatarPublicId !== req.file.public_id) {
      await deleteFromCloudinary(user.avatarPublicId, 'image');
    }

    user.avatarUrl = avatarUrl;
    if (req.file.public_id) {
      user.avatarPublicId = req.file.public_id;
    }
    await user.save();

    const cleanUser = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: cleanUser,
      user: cleanUser,
      avatarUrl,
      message: 'Profile image uploaded successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user saved jobs
// @route   GET /api/users/me/saved-jobs
exports.getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedJobs',
      populate: [
        { path: 'employerId', select: 'companyName logoUrl location' },
        { path: 'categoryId', select: 'name slug' }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const formattedJobs = (user.savedJobs || []).map(j => {
      if (!j) return null;
      const plain = j.toObject ? j.toObject() : j;
      return {
        ...plain,
        companyName: plain.companyName || plain.employerId?.companyName || 'Company',
        category: plain.category || plain.categoryId?.name || 'General',
        jobType: plain.jobType || 'Full-time',
        salaryMin: plain.salaryMin || 0,
        salaryMax: plain.salaryMax || 0
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      data: formattedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a job
// @route   POST /api/users/me/saved-jobs/:jobId
exports.saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.savedJobs.includes(jobId)) {
      user.savedJobs.push(jobId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Job saved successfully',
      data: user.savedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved job
// @route   DELETE /api/users/me/saved-jobs/:jobId
exports.removeSavedJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Job removed from saved jobs',
      data: user.savedJobs
    });
  } catch (error) {
    next(error);
  }
};

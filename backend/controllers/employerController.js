const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get current employer profile
// @route   GET /api/employers/me
exports.getEmployerProfile = async (req, res, next) => {
  try {
    const profile = await Employer.findOne({ userId: req.user.id }).populate('userId', 'name email');

    if (!profile) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or Update employer profile
// @route   PUT /api/employers/me
exports.updateEmployerProfile = async (req, res, next) => {
  try {
    const { companyName, companyDescription, website, location, logoUrl, address, phone } = req.body;
    
    // Check if profile exists
    let profile = await Employer.findOne({ userId: req.user.id });

    if (profile) {
      // Update
      profile = await Employer.findOneAndUpdate(
        { userId: req.user.id },
        { companyName, companyDescription, website, location, logoUrl, address, phone },
        { new: true, returnDocument: 'after', runValidators: true }
      ).populate('userId', 'name email');
    } else {
      // Create
      profile = await Employer.create({
        userId: req.user.id,
        companyName,
        companyDescription,
        website,
        location,
        logoUrl,
        address,
        phone
      });
      profile = await Employer.findById(profile._id).populate('userId', 'name email');
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by the current employer
// @route   GET /api/employers/me/jobs
exports.getEmployerJobs = async (req, res, next) => {
  try {
    const profile = await Employer.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Employer profile not found. Cannot fetch jobs.' });
    }

    const jobs = await Job.find({ employerId: profile._id })
      .sort('-createdAt')
      .populate('categoryId', 'name');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload company logo
// @route   POST /api/employers/me/logo
exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    let profile = await Employer.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new Employer({
        userId: req.user.id,
        companyName: req.user.name || 'Company',
      });
    }

    const logoUrl =
      req.file.secure_url ||
      req.file.path ||
      `/uploads/images/${req.file.filename}`;

    // Clean up previous Cloudinary logo asset if replacing
    if (profile.logoPublicId && req.file.public_id && profile.logoPublicId !== req.file.public_id) {
      await deleteFromCloudinary(profile.logoPublicId, 'image');
    }

    profile.logoUrl = logoUrl;
    if (req.file.public_id) {
      profile.logoPublicId = req.file.public_id;
    }
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Company logo uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employer dashboard statistics
// @route   GET /api/employers/me/stats
exports.getEmployerStats = async (req, res, next) => {
  try {
    const profile = await Employer.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    // All jobs by this employer
    const allJobs = await Job.find({ employerId: profile._id }).select('_id isActive adminStatus');
    const jobIds = allJobs.map(j => j._id);

    const totalJobs    = allJobs.length;
    const activeJobs   = allJobs.filter(j => j.isActive && j.adminStatus === 'Approved').length;
    const closedJobs   = allJobs.filter(j => !j.isActive).length;

    // Applications across all employer's jobs
    const totalApplications = await Application.countDocuments({ jobId: { $in: jobIds } });

    // Applications in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newApplications = await Application.countDocuments({
      jobId: { $in: jobIds },
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        closedJobs,
        totalApplications,
        newApplications
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.getEmployerApplicants = async (req, res, next) => {
  try {
    const profile = await Employer.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const jobs = await Job.find({ employerId: profile._id }).select('_id title');
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('applicantId', 'name email phone location education experience skills resumeUrl')
      .populate('jobId', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get employer profile by ID
// @route   GET /api/employers/:id
exports.getEmployerById = async (req, res, next) => {
  try {
    const employer = await Employer.findById(req.params.id).populate('userId', 'name email');
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    res.status(200).json({
      success: true,
      data: employer
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employer not found' });
    }
    next(error);
  }
};

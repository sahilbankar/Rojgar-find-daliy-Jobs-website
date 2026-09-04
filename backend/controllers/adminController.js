const User = require('../models/User');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobSeekers = await User.countDocuments({ role: 'jobseeker' });
    const totalEmployers = await Employer.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Aggregations for charts if needed
    const jobsByStatus = await Job.aggregate([
      { $group: { _id: '$adminStatus', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalJobSeekers,
        totalEmployers,
        totalJobs,
        totalApplications,
        jobsByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};


// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin user' });
    }
    // If the user is an employer, clean up employer data
    if (user.role === 'employer') {
      const Employer = require('../models/Employer');
      const employer = await Employer.findOne({ userId: user._id });
      if (employer) {
        const Job = require('../models/Job');
        const Application = require('../models/Application');
        const jobs = await Job.find({ employerId: employer._id });
        const jobIds = jobs.map(j => j._id);
        await Application.deleteMany({ jobId: { $in: jobIds } });
        await Job.deleteMany({ employerId: employer._id });
        await Employer.findByIdAndDelete(employer._id);
      }
    } else {
      // If user is a jobseeker, delete their applications
      const Application = require('../models/Application');
      await Application.deleteMany({ applicantId: user._id });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block/unblock user
// @route   PUT /api/admin/users/:id/block
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block an admin user' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: `User successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all employers
// @route   GET /api/admin/employers
exports.getAllEmployers = async (req, res, next) => {
  try {
    const employers = await Employer.find().populate('userId', 'name email phone isBlocked createdAt');
    res.status(200).json({ success: true, count: employers.length, data: employers });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employer
// @route   DELETE /api/admin/employers/:id
exports.deleteEmployer = async (req, res, next) => {
  try {
    const employer = await Employer.findById(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    const Job = require('../models/Job');
    const Application = require('../models/Application');
    const jobs = await Job.find({ employerId: employer._id });
    const jobIds = jobs.map(j => j._id);
    await Application.deleteMany({ jobId: { $in: jobIds } });
    await Job.deleteMany({ employerId: employer._id });

    await User.findByIdAndDelete(employer.userId);
    await Employer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Employer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs
// @route   GET /api/admin/jobs
exports.getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate('employerId categoryId').lean();
    
    // Add application counts
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const applicantCount = await Application.countDocuments({ jobId: job._id });
      return { ...job, applicantCount };
    }));

    res.status(200).json({ success: true, count: jobsWithCounts.length, data: jobsWithCounts });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job status (Approve/Reject)
// @route   PUT /api/admin/jobs/:id/status
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { adminStatus: status },
      { new: true, returnDocument: 'after', runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications
// @route   GET /api/admin/applications
exports.getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate({ path: 'jobId', populate: { path: 'employerId' } })
      .populate('applicantId', 'name email phone');
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/admin/jobs/:id
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Delete all applications related to this job
    await Application.deleteMany({ jobId: job._id });
    await Job.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Category
// @route   POST /api/admin/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    
    // Check if category already exists
    const Category = require('../models/Category');
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Category already exists' });
    
    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Category
// @route   PUT /api/admin/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const Category = require('../models/Category');
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Category
// @route   DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const Category = require('../models/Category');
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Job Type
// @route   POST /api/admin/job-types
exports.createJobType = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Job Type name is required' });
    
    const JobType = require('../models/JobType');
    const existing = await JobType.findOne({ name: name.trim() });
    if (existing) return res.status(400).json({ message: 'Job Type already exists' });
    
    const jobType = await JobType.create({ name: name.trim() });
    res.status(201).json({ success: true, data: jobType });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Job Type
// @route   PUT /api/admin/job-types/:id
exports.updateJobType = async (req, res, next) => {
  try {
    const JobType = require('../models/JobType');
    const jobType = await JobType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!jobType) return res.status(404).json({ message: 'Job Type not found' });
    res.status(200).json({ success: true, data: jobType });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Job Type
// @route   DELETE /api/admin/job-types/:id
exports.deleteJobType = async (req, res, next) => {
  try {
    const JobType = require('../models/JobType');
    const jobType = await JobType.findByIdAndDelete(req.params.id);
    if (!jobType) return res.status(404).json({ message: 'Job Type not found' });
    res.status(200).json({ success: true, message: 'Job Type deleted successfully' });
  } catch (error) {
    next(error);
  }
};



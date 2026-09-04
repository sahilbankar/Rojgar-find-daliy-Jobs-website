const mongoose = require('mongoose');
const Job = require('../models/Job');
const Employer = require('../models/Employer');
const Category = require('../models/Category');

// @desc    Create a job
// @route   POST /api/jobs
exports.createJob = async (req, res, next) => {
  try {
    // Find employer profile
    let employerProfile = await Employer.findOne({ userId: req.user.id });
    
    if (!employerProfile) {
      // Auto-create employer profile if not found
      employerProfile = await Employer.create({
        userId: req.user.id,
        companyName: req.user.name || 'Company',
        phone: req.user.phone || ''
      });
    }

    req.body.employerId = employerProfile._id;
    req.body.companyName = req.body.companyName || employerProfile.companyName || req.user.name || 'Company';

    // Populate category name if categoryId is provided
    if (req.body.categoryId) {
      try {
        const catDoc = await Category.findById(req.body.categoryId);
        if (catDoc) {
          req.body.category = catDoc.name;
        }
      } catch (catErr) {
        console.warn('Category lookup note:', catErr.message);
      }
    }

    // Parse salaryMin and salaryMax from fields if present
    if (req.body.minSalary !== undefined) {
      req.body.salaryMin = Number(req.body.minSalary) || 0;
    }
    if (req.body.maxSalary !== undefined) {
      req.body.salaryMax = Number(req.body.maxSalary) || 0;
    }

    // Ensure job is approved and active so it immediately displays on Home Page and All Jobs
    req.body.adminStatus = 'Approved';
    req.body.isActive = true;

    // Normalize requirements if passed as a string
    if (typeof req.body.requirements === 'string') {
      if (req.body.requirements.includes('\n')) {
        req.body.requirements = req.body.requirements.split('\n').map(r => r.trim()).filter(Boolean);
      } else if (req.body.requirements.includes(',')) {
        req.body.requirements = req.body.requirements.split(',').map(r => r.trim()).filter(Boolean);
      } else if (req.body.requirements.trim()) {
        req.body.requirements = [req.body.requirements.trim()];
      } else {
        req.body.requirements = [];
      }
    }

    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs (with search, filter, sort, pagination)
// @route   GET /api/jobs
exports.getJobs = async (req, res, next) => {
  try {
    const mongoQuery = {};

    // 1. Keyword search (Title, Company Name, Location, Category, Description)
    const searchTerm = req.query.keyword || req.query.q;
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      mongoQuery.$or = [
        { title: searchRegex },
        { companyName: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    // 2. Specific Filters
    if (req.query.location) {
      mongoQuery.location = new RegExp(req.query.location.trim(), 'i');
    }

    if (req.query.jobType && req.query.jobType !== 'All') {
      mongoQuery.jobType = new RegExp(req.query.jobType.trim(), 'i');
    }

    if (req.query.category && req.query.category !== 'All') {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        mongoQuery.categoryId = req.query.category;
      } else {
        mongoQuery.category = new RegExp(req.query.category.trim(), 'i');
      }
    }

    if (req.query.categoryId) {
      mongoQuery.categoryId = req.query.categoryId;
    }

    // Experience filter
    if (req.query.experience !== undefined && req.query.experience !== '' && req.query.experience !== 'All') {
      const expQuery = req.query.experience;
      if (expQuery === 'Fresher' || expQuery === '0') {
        mongoQuery.experience = { $in: ['Fresher', 0, '0'] };
      } else if (expQuery === '1 Year' || expQuery === '1') {
        mongoQuery.experience = { $in: ['1 Year', 1, '1'] };
      } else if (expQuery === '2 Years' || expQuery === '2') {
        mongoQuery.experience = { $in: ['2 Years', 2, '2'] };
      } else if (expQuery === '3 Years' || expQuery === '3') {
        mongoQuery.experience = { $in: ['3 Years', 3, '3'] };
      } else if (expQuery === '4 Years' || expQuery === '4') {
        mongoQuery.experience = { $in: ['4 Years', 4, '4'] };
      } else if (expQuery === '5+ Years' || expQuery === '5') {
        mongoQuery.experience = { $in: ['5+ Years', 5, '5', '5+'] };
      } else {
        mongoQuery.experience = expQuery;
      }
    }

    // Salary filtering
    if (req.query.minSalary) {
      const minSal = parseInt(req.query.minSalary, 10);
      if (!isNaN(minSal)) {
        mongoQuery.$and = mongoQuery.$and || [];
        mongoQuery.$and.push({
          $or: [
            { salaryMax: { $gte: minSal } },
            { salaryMin: { $gte: minSal } }
          ]
        });
      }
    }

    if (req.query.maxSalary) {
      const maxSal = parseInt(req.query.maxSalary, 10);
      if (!isNaN(maxSal)) {
        mongoQuery.$and = mongoQuery.$and || [];
        mongoQuery.$and.push({ salaryMin: { $lte: maxSal } });
      }
    }

    // Default: Only active jobs for public candidate browsing
    if (req.query.isActive !== undefined) {
      mongoQuery.isActive = req.query.isActive === 'true' || req.query.isActive === true;
    } else {
      mongoQuery.isActive = true;
    }

    // Filter by adminStatus (or default to approved/active jobs)
    if (req.query.adminStatus) {
      mongoQuery.adminStatus = req.query.adminStatus;
    } else {
      mongoQuery.adminStatus = { $in: ['Approved', 'Pending'] };
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
      if (req.query.sort === 'salaryMax' || req.query.sort === '-salaryMax') {
        sortOption = req.query.sort.startsWith('-') ? { salaryMax: -1 } : { salaryMax: 1 };
      } else if (req.query.sort === 'createdAt' || req.query.sort === '-createdAt') {
        sortOption = req.query.sort.startsWith('-') ? { createdAt: -1 } : { createdAt: 1 };
      } else {
        const field = req.query.sort.replace('-', '');
        const order = req.query.sort.startsWith('-') ? -1 : 1;
        sortOption = { [field]: order };
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Job.countDocuments(mongoQuery);
    const totalPages = Math.ceil(total / limit) || 1;

    const jobs = await Job.find(mongoQuery)
      .populate('employerId', 'companyName logoUrl')
      .populate('categoryId', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Format job entries to guarantee companyName, category, and salary fields
    const formattedJobs = jobs.map(j => {
      const plain = j.toObject();
      return {
        ...plain,
        companyName: plain.companyName || plain.employerId?.companyName || 'Company',
        category: plain.category || plain.categoryId?.name || 'General',
        jobType: plain.jobType || 'Full-time',
        experienceYears: plain.experienceYears !== undefined ? plain.experienceYears : (plain.experience ?? 'Fresher'),
        remainingVacancies: plain.remainingVacancies !== undefined ? plain.remainingVacancies : Math.max(0, (plain.totalVacancies || 1) - (plain.applications ? plain.applications.length : 0))
      };
    });

    res.status(200).json({
      success: true,
      count: formattedJobs.length,
      total,
      page,
      totalPages,
      pagination: {
        next: page < totalPages ? { page: page + 1, limit } : undefined,
        prev: page > 1 ? { page: page - 1, limit } : undefined
      },
      jobs: formattedJobs,
      data: formattedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job details
// @route   GET /api/jobs/:id
exports.getJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format to prevent CastError crashes
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Job not found or invalid Job ID' });
    }

    const job = await Job.findById(id)
      .populate('employerId', 'companyName logoUrl location companyDescription')
      .populate('categoryId', 'name slug')
      .populate('applications');

    if (!job) {
      return res.status(404).json({ message: 'Job not found or has been removed' });
    }

    // Dynamic Vacancy Calculation removed per requirements
    const totalVacancies = job.totalVacancies || job.vacancies || 1;
    // Fallback if missing in old data
    let remainingVacancies = job.remainingVacancies;
    if (remainingVacancies === undefined) {
      const appCount = job.applications ? job.applications.length : 0;
      remainingVacancies = Math.max(0, totalVacancies - appCount);
    }

    const jobData = job.toObject();
    jobData.companyName = jobData.companyName || jobData.employerId?.companyName || 'Company';
    jobData.category = jobData.category || jobData.categoryId?.name || 'General';
    jobData.totalVacancies = totalVacancies;
    jobData.vacancies = totalVacancies;
    jobData.remainingVacancies = remainingVacancies;
    jobData.experienceYears = jobData.experienceYears !== undefined ? jobData.experienceYears : (jobData.experience ?? 'Fresher');

    res.status(200).json({
      success: true,
      data: jobData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const employerProfile = await Employer.findOne({ userId: req.user.id });

    // Make sure user is job owner or admin
    if (job.employerId.toString() !== employerProfile?._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      returnDocument: 'after',
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const employerProfile = await Employer.findOne({ userId: req.user.id });

    // Make sure user is job owner or admin
    if (job.employerId.toString() !== employerProfile?._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to delete this job' });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close a job
// @route   PUT /api/jobs/:id/close
exports.closeJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const employerProfile = await Employer.findOne({ userId: req.user.id });

    // Make sure user is job owner or admin
    if (job.employerId.toString() !== employerProfile?._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to close this job' });
    }

    job.isActive = false;
    await job.save();

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

const Application = require('../models/Application');
const Job = require('../models/Job');
const Employer = require('../models/Employer');

// @desc    Apply for a job
// @route   POST /api/jobs/:jobId/applications
exports.applyForJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const applicantId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: 'Job is no longer active for applications' });
    }

    // Check if remaining vacancies are zero or negative
    const currentRemaining = job.remainingVacancies !== undefined ? job.remainingVacancies : (job.totalVacancies - (job.applications ? job.applications.length : 0));
    if (currentRemaining <= 0) {
      return res.status(400).json({ message: 'No vacancies remaining for this job' });
    }

    // Duplicate application prevention
    const existingApplication = await Application.findOne({
      jobId,
      applicantId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const { coverLetter, resumeUrl, experience } = req.body;
    const effectiveResumeUrl = resumeUrl || req.user.resumeUrl;

    const application = await Application.create({
      jobId,
      applicantId,
      coverLetter,
      resumeUrl: effectiveResumeUrl,
      experience: experience || req.user.experience,
      status: 'Applied'
    });

    // Decrease the remaining vacancy count
    if (job.remainingVacancies === undefined) {
       // initialize it if missing
       const appCount = await Application.countDocuments({ jobId });
       job.remainingVacancies = Math.max(0, job.totalVacancies - appCount);
    } else {
       job.remainingVacancies = Math.max(0, job.remainingVacancies - 1);
    }
    
    // Automatically close job if vacancies reach 0
    if (job.remainingVacancies === 0) {
      job.isActive = false;
    }
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: application
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    next(error);
  }
};

// @desc    Get job seeker's applications
// @route   GET /api/applications/me
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicantId: req.user.id })
      .populate({
        path: 'jobId',
        select: 'title location salaryRange employerId companyName salaryMin salaryMax category jobType',
        populate: {
          path: 'employerId',
          select: 'companyName logoUrl userId',
          populate: {
            path: 'userId',
            select: 'name'
          }
        }
      })
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

// @desc    Get single application details
// @route   GET /api/applications/:id
exports.getApplicationDetails = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('applicantId', 'name email skills resumeUrl');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Authorization checks
    const isApplicant = application.applicantId._id.toString() === req.user.id;
    let isEmployer = false;

    if (req.user.role === 'employer') {
      const employerProfile = await Employer.findOne({ userId: req.user.id });
      if (employerProfile && application.jobId.employerId.toString() === employerProfile._id.toString()) {
        isEmployer = true;
      }
    }

    if (!isApplicant && !isEmployer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applicants for a specific job
// @route   GET /api/jobs/:jobId/applications
exports.getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const employerProfile = await Employer.findOne({ userId: req.user.id });

    // Make sure user is the job owner or admin
    if (job.employerId.toString() !== employerProfile?._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to view applicants for this job' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('applicantId', 'name email skills resumeUrl');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    let application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const employerProfile = await Employer.findOne({ userId: req.user.id });

    // Ensure the user is the employer who posted the job, or an admin
    if (application.jobId.employerId.toString() !== employerProfile?._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Pending', 'Reviewed', 'Interviewing', 'Accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    application.status = status;
    await application.save();

    // Dynamic Vacancy Logic
    if (status === 'Accepted') {
      const job = application.jobId; // Populated jobId
      
      // Count currently accepted candidates
      const acceptedCount = await Application.countDocuments({
        jobId: job._id,
        status: 'Accepted'
      });

      // Close job automatically if vacancies reach zero
      if (acceptedCount >= job.totalVacancies && job.isActive) {
        job.isActive = false;
        await job.save();
      }
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

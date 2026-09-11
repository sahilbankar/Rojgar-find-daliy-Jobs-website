const Application = require('../models/Application');
const Job = require('../models/Job');

class ApplicationService {
  /**
   * Submit a job application
   */
  async createApplication(jobId, applicantId, data = {}) {
    const existing = await Application.findOne({ jobId, applicantId });
    if (existing) {
      const error = new Error('You have already applied for this job.');
      error.statusCode = 400;
      throw error;
    }

    const application = await Application.create({
      jobId,
      applicantId,
      coverLetter: data.coverLetter || '',
      resumeUrl: data.resumeUrl || '',
      experience: data.experience || '',
      status: 'Applied'
    });

    // Update remaining vacancies on job
    try {
      const job = await Job.findById(jobId);
      if (job && job.remainingVacancies > 0) {
        job.remainingVacancies = Math.max(0, job.remainingVacancies - 1);
        await job.save();
      }
    } catch (e) {
      console.warn('Notice updating remaining vacancies:', e.message);
    }

    return application;
  }

  /**
   * Get applications for a specific applicant
   */
  async getApplicationsByApplicant(applicantId) {
    return Application.find({ applicantId })
      .populate({
        path: 'jobId',
        select: 'title companyName location salaryRange jobType employerId category',
        populate: { path: 'employerId', select: 'companyName logoUrl' }
      })
      .sort({ createdAt: -1 });
  }

  /**
   * Get applications for a specific job
   */
  async getApplicationsByJob(jobId) {
    return Application.find({ jobId })
      .populate('applicantId', 'name email phone avatarUrl resumeUrl experience skills education')
      .sort({ createdAt: -1 });
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId, status) {
    return Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true, runValidators: true }
    );
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id) {
    return Application.findById(id)
      .populate('jobId')
      .populate('applicantId', 'name email phone avatarUrl resumeUrl experience skills education');
  }
}

module.exports = new ApplicationService();

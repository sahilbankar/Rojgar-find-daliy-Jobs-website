const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Pending', 'Reviewed', 'Interviewing', 'Accepted'],
      default: 'Applied',
    },
    coverLetter: {
      type: String,
    },
    resumeUrl: {
      type: String,
    },
    experience: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications at database level
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

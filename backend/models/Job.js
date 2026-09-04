const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    salaryRange: {
      type: String,
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    jobType: {
      type: String,
      default: 'Full-time',
    },
    totalVacancies: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    remainingVacancies: {
      type: Number,
      default: function() { return this.totalVacancies; },
      min: 0
    },
    requirements: {
      type: [String],
      default: [],
    },
    experience: {
      type: mongoose.Schema.Types.Mixed,
      default: 'Fresher',
    },
    applicationDeadline: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adminStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'jobId',
  justOne: false
});

module.exports = mongoose.model('Job', jobSchema);

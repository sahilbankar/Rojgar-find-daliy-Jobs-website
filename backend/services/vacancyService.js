const Job = require('../models/Job');
const Application = require('../models/Application');

exports.updateJobVacancies = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) return null;

  // Count how many applications are 'Accepted'
  const acceptedCount = await Application.countDocuments({
    job: jobId,
    status: 'Accepted'
  });

  if (acceptedCount >= job.totalVacancies) {
    job.isActive = false;
  }

  await job.save();
  return job;
};

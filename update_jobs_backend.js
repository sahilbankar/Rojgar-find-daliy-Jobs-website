const fs = require('fs');

const ctrlPath = 'backend/controllers/adminController.js';
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');

// 1. Update getAllJobs to include applicant counts
const oldGetAllJobs = `exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('employerId categoryId');
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};`;

const newGetAllJobs = `exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('employerId categoryId').lean();
    
    // Add application counts
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const applicantCount = await Application.countDocuments({ jobId: job._id });
      return { ...job, applicantCount };
    }));

    res.status(200).json({ success: true, count: jobsWithCounts.length, data: jobsWithCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};`;

ctrlContent = ctrlContent.replace(oldGetAllJobs, newGetAllJobs);

// 2. Add deleteJob
const deleteJobCode = `
// @desc    Delete job
// @route   DELETE /api/admin/jobs/:id
exports.deleteJob = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};
`;

if (!ctrlContent.includes('exports.deleteJob =')) {
    ctrlContent += deleteJobCode;
    fs.writeFileSync(ctrlPath, ctrlContent);
}

const routePath = 'backend/routes/adminRoutes.js';
let routeContent = fs.readFileSync(routePath, 'utf8');
if (!routeContent.includes('deleteJob')) {
    routeContent = routeContent.replace('updateJobStatus,', 'updateJobStatus,\n  deleteJob,');
    routeContent = routeContent.replace("router.put('/jobs/:id/status', updateJobStatus);", "router.put('/jobs/:id/status', updateJobStatus);\nrouter.delete('/jobs/:id', deleteJob);");
    fs.writeFileSync(routePath, routeContent);
}

const apiPath = 'frontend/src/api/admin.ts';
let apiContent = fs.readFileSync(apiPath, 'utf8');
if (!apiContent.includes('deleteJob: async')) {
    const updateStatusCode = `  updateJobStatus: async (id: string, status: string) => {
    const response = await api.put(\`/admin/jobs/\${id}/status\`, { status });
    return response.data;
  },`;
    
    const deleteJobCodeStr = `  deleteJob: async (id: string) => {
    const response = await api.delete(\`/admin/jobs/\${id}\`);
    return response.data;
  },`;
    apiContent = apiContent.replace(updateStatusCode, updateStatusCode + '\n' + deleteJobCodeStr);
    fs.writeFileSync(apiPath, apiContent);
}

console.log('Backend and API updated for Jobs');

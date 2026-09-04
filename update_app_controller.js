const fs = require('fs');
let code = fs.readFileSync('backend/controllers/applicationController.js', 'utf8');

const applyForJobLogicRegex = /if \(!job\.isActive\) \{[\s\S]*?return res\.status\(400\)\.json\(\{ message: 'Job is no longer active for applications' \}\);[\s\S]*?\}/;
code = code.replace(applyForJobLogicRegex, `if (!job.isActive) {
      return res.status(400).json({ message: 'Job is no longer active for applications' });
    }

    // Check if remaining vacancies are zero or negative
    const currentRemaining = job.remainingVacancies !== undefined ? job.remainingVacancies : (job.totalVacancies - (job.applications ? job.applications.length : 0));
    if (currentRemaining <= 0) {
      return res.status(400).json({ message: 'No vacancies remaining for this job' });
    }`);

const afterApplicationCreateRegex = /const application = await Application\.create\(\{[\s\S]*?status: 'Applied'[\s\S]*?\}\);/;
code = code.replace(afterApplicationCreateRegex, `const application = await Application.create({
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
    await job.save();`);

fs.writeFileSync('backend/controllers/applicationController.js', code, 'utf8');
console.log('Updated applicationController.js');

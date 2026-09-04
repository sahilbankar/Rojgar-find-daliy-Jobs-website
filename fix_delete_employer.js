const fs = require('fs');
const path = 'backend/controllers/adminController.js';
let code = fs.readFileSync(path, 'utf8');

const oldCode = `    await User.findByIdAndDelete(employer.userId);
    await Employer.findByIdAndDelete(req.params.id);`;

const newCode = `    const Job = require('../models/Job');
    const Application = require('../models/Application');
    const jobs = await Job.find({ employerId: employer._id });
    const jobIds = jobs.map(j => j._id);
    await Application.deleteMany({ jobId: { $in: jobIds } });
    await Job.deleteMany({ employerId: employer._id });

    await User.findByIdAndDelete(employer.userId);
    await Employer.findByIdAndDelete(req.params.id);`;

if (code.includes('await User.findByIdAndDelete(employer.userId);')) {
    code = code.replace(oldCode, newCode);
    fs.writeFileSync(path, code, 'utf8');
    console.log('Fixed deleteEmployer');
} else {
    console.log('Could not find replace string');
}

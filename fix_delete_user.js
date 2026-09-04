const fs = require('fs');
const path = 'backend/controllers/adminController.js';
let code = fs.readFileSync(path, 'utf8');

const oldDeleteUser = `    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });`;

const newDeleteUser = `    // If the user is an employer, clean up employer data
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
    res.status(200).json({ success: true, message: 'User deleted successfully' });`;

if (code.includes('await User.findByIdAndDelete(req.params.id);')) {
    code = code.replace(oldDeleteUser, newDeleteUser);
    fs.writeFileSync(path, code, 'utf8');
    console.log('Fixed deleteUser');
} else {
    console.log('Could not find replace string for deleteUser');
}

const fs = require('fs');

const ctrlPath = 'backend/controllers/adminController.js';
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');

const oldPopulate = `.populate('jobId')
      .populate('applicantId', 'name email');`;

const newPopulate = `.populate({ path: 'jobId', populate: { path: 'employerId' } })
      .populate('applicantId', 'name email phone');`;

if (ctrlContent.includes('.populate(\'jobId\')')) {
    ctrlContent = ctrlContent.replace(oldPopulate, newPopulate);
    fs.writeFileSync(ctrlPath, ctrlContent);
    console.log('Backend applications populate updated.');
} else {
    console.log('Already updated or pattern not found.');
}

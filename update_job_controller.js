const fs = require('fs');
let code = fs.readFileSync('backend/controllers/jobController.js', 'utf8');

// Update createJob to include remainingVacancies
code = code.replace(/const job = await Job\.create\(\{[\s\S]*?\.\.\.req\.body,[\s\S]*?employerId: req\.user\.id,[\s\S]*?\}\);/, `const job = await Job.create({
      ...req.body,
      employerId: req.user.id,
      remainingVacancies: req.body.totalVacancies || 1,
    });`);

// Update getJob (singular) dynamic calculation
const dynamicCalcRegex = /\/\/ Dynamic Vacancy Calculation[\s\S]*?const remainingVacancies = Math\.max\(0, totalVacancies - selectedCandidates\);/;
code = code.replace(dynamicCalcRegex, `// Dynamic Vacancy Calculation removed per requirements
    const totalVacancies = job.totalVacancies || job.vacancies || 1;
    // Fallback if missing in old data
    let remainingVacancies = job.remainingVacancies;
    if (remainingVacancies === undefined) {
      const appCount = job.applications ? job.applications.length : 0;
      remainingVacancies = Math.max(0, totalVacancies - appCount);
    }`);

const getJobJobDataRegex = /jobData\.totalVacancies = totalVacancies;[\s\S]*?jobData\.remainingVacancies = remainingVacancies;/;
code = code.replace(getJobJobDataRegex, `jobData.totalVacancies = totalVacancies;
    jobData.vacancies = totalVacancies;
    jobData.remainingVacancies = remainingVacancies;`);

// Update getJobs (plural) formatting
const getJobsFormattingRegex = /remainingVacancies: plain\.remainingVacancies !== undefined \? plain\.remainingVacancies : \(plain\.totalVacancies \|\| 1\)/;
code = code.replace(getJobsFormattingRegex, `remainingVacancies: plain.remainingVacancies !== undefined ? plain.remainingVacancies : Math.max(0, (plain.totalVacancies || 1) - (plain.applications ? plain.applications.length : 0))`);

fs.writeFileSync('backend/controllers/jobController.js', code, 'utf8');
console.log('Updated jobController.js');

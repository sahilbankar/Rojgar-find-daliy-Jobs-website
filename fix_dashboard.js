const fs = require('fs');
const dashboardPath = 'frontend/src/pages/dashboards/EmployerDashboard.tsx';
let content = fs.readFileSync(dashboardPath, 'utf8');

// 1. Remove duplicate `getApplicants` calls
// We can just keep the first one by replacing all of them with empty string, 
// then putting it back right after employersAPI.getJobs()
const getApplicantsRegex = /employersAPI\.getApplicants\(\)[\s\S]*?\.catch\(\(\) => setApplicantsLoading\(false\)\);/g;
content = content.replace(getApplicantsRegex, '');

// Now add it back once
const insertAfterJobs = "setJobsLoading(false);\n        fetchApplicantCounts(jobList);\n      })\n      .catch(() => setJobsLoading(false));";
const getApplicantsBlock = `
    employersAPI.getApplicants()
      .then(res => {
        setAllApplicants(res.data || []);
        setApplicantsLoading(false);
      })
      .catch(() => setApplicantsLoading(false));
`;

content = content.replace(insertAfterJobs, insertAfterJobs + '\n' + getApplicantsBlock);

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('Fixed duplicates');

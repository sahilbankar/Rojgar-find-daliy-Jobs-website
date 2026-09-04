const fs = require('fs');

let jobsPage = fs.readFileSync('frontend/src/pages/JobsPage.tsx', 'utf8');
jobsPage = jobsPage.replace(/interface GetJobsResponse {[\s\S]*?}/, 'interface GetJobsResponse { data: Job[]; pagination?: any; }');
fs.writeFileSync('frontend/src/pages/JobsPage.tsx', jobsPage, 'utf8');

let jobDetail = fs.readFileSync('frontend/src/pages/JobDetailPage.tsx', 'utf8');
jobDetail = jobDetail.replace('setJob(res.data);', 'setJob((res as any).data || res);');
fs.writeFileSync('frontend/src/pages/JobDetailPage.tsx', jobDetail, 'utf8');

console.log('Fixed JobsPage and JobDetailPage types');

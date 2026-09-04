const fs = require('fs');
const dashboardPath = 'frontend/src/pages/dashboards/EmployerDashboard.tsx';
let content = fs.readFileSync(dashboardPath, 'utf8');

// Fix types in renderApplicants
content = content.replace('const getAppStatusColor = (st) => {', 'const getAppStatusColor = (st: string) => {');
content = content.replace('const formatDate = (dateString) => {', 'const formatDate = (dateString: any) => {');
content = content.replace('applicantViewModal.applicantId.skills.map((sk, i) => (', 'applicantViewModal.applicantId.skills.map((sk: string, i: number) => (');

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('Fixed types');

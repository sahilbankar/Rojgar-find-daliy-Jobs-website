const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\.catch\(console\.error\)/g, `.catch(err => alert(err.response?.data?.message || 'An error occurred while processing your request.'))`);

fs.writeFileSync(path, code, 'utf8');
console.log('Fixed catch(console.error) in AdminDashboard');

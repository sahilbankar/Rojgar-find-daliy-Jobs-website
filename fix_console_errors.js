const fs = require('fs');

// Increase Axios timeout and remove console.error
let axiosCode = fs.readFileSync('frontend/src/api/axios.ts', 'utf8');
axiosCode = axiosCode.replace('timeout: 15000,', 'timeout: 30000,');
axiosCode = axiosCode.replace(/console\.error\('API Error: Network Error or Server Unreachable',\s*error\.request\);/, '');
fs.writeFileSync('frontend/src/api/axios.ts', axiosCode, 'utf8');

// Remove console errors in JobSeekerDashboard
let jsCode = fs.readFileSync('frontend/src/pages/dashboards/JobSeekerDashboard.tsx', 'utf8');
jsCode = jsCode.replace(/console\.error\('Fetch profile error:', err\);/g, '');
jsCode = jsCode.replace(/console\.error\('Fetch saved jobs error:', err\);/g, '');
jsCode = jsCode.replace(/console\.error\('Error fetching jobseeker applications:', err\);/g, '');
jsCode = jsCode.replace(/console\.error\('Remove saved job error:', err\);/g, "alert(err.response?.data?.message || 'Error removing job');");
jsCode = jsCode.replace(/console\.error\('Resume upload error:', err\);/g, '');
jsCode = jsCode.replace(/console\.error\('Avatar upload error:', err\);/g, '');
jsCode = jsCode.replace(/console\.error\('Profile update error:', err\);/g, '');
fs.writeFileSync('frontend/src/pages/dashboards/JobSeekerDashboard.tsx', jsCode, 'utf8');

console.log('Fixed axios and JobSeekerDashboard console errors');

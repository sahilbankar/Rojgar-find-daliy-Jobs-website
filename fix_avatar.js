const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldImg = `<img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />`;
const newImg = `<img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : \`http://localhost:5000\${user.avatarUrl}\`} alt="Avatar" className="w-full h-full object-cover" />`;

if (code.includes(oldImg)) {
    code = code.replace(oldImg, newImg);
    fs.writeFileSync(path, code, 'utf8');
    console.log('Fixed admin avatar img src');
} else {
    console.log('Could not find img src to fix');
}

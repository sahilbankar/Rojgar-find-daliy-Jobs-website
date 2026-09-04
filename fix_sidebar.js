const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldSidebarLogo = `<div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>`;

const newSidebarLogo = `{user?.avatarUrl ? (
              <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : \`http://localhost:5000\${user.avatarUrl}\`} alt="Avatar" className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}`;

if (code.includes(oldSidebarLogo)) {
    code = code.replace(oldSidebarLogo, newSidebarLogo);
    fs.writeFileSync(path, code, 'utf8');
    console.log('Fixed sidebar logo');
} else {
    console.log('Could not find sidebar logo');
}

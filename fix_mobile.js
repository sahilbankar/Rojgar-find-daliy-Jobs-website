const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldMobileLogo = `<div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
             <ShieldCheck className="w-6 h-6" />
           </div>`;

const newMobileLogo = `{user?.avatarUrl ? (
             <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : \`http://localhost:5000\${user.avatarUrl}\`} alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />
           ) : (
             <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
               <ShieldCheck className="w-6 h-6" />
             </div>
           )}`;

if (code.includes(oldMobileLogo)) {
    code = code.replace(oldMobileLogo, newMobileLogo);
    fs.writeFileSync(path, code, 'utf8');
    console.log('Fixed mobile logo');
} else {
    console.log('Could not find mobile logo');
}

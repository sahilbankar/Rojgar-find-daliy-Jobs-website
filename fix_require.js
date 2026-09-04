const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/const api = require\('\.\.\/\.\.\/api\/axios'\)\.default;/g, '');
if (!code.includes("import api from '../../api/axios';")) {
    code = "import api from '../../api/axios';\n" + code;
}

fs.writeFileSync(path, code, 'utf8');
console.log('Fixed require error');

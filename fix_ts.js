const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/JobDetailPage.tsx', 'utf8');
code = code.replace(/import \{ Link, useParams, useNavigate \} from 'react-router-dom';/, "import { Link, useParams } from 'react-router-dom';");
code = code.replace(/const navigate = useNavigate\(\);\n/, '');
fs.writeFileSync('frontend/src/pages/JobDetailPage.tsx', code, 'utf8');
console.log('Fixed TS Error');

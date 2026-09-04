const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.tsx', 'utf8');

code = code.replace('<Router>', '<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>');
fs.writeFileSync('frontend/src/App.tsx', code, 'utf8');
console.log('Fixed React Router warnings');

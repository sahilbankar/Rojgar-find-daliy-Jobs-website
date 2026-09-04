const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/Navbar.tsx', 'utf8');

// The exact string to remove (Desktop)
const desktopLinkRegex = /\{latestJobId \? \([\s\S]*?<NavLink to=\{\`\/jobs\/\$\{latestJobId\}\`\} className=\{navLinkClass\}>[\s\S]*?Job Details[\s\S]*?<\/NavLink>[\s\S]*?\) : null\}/;
code = code.replace(desktopLinkRegex, '');

// The exact string to remove (Mobile)
const mobileLinkRegex = /\{latestJobId \? \([\s\S]*?<NavLink[\s\S]*?to=\{\`\/jobs\/\$\{latestJobId\}\`\}[\s\S]*?className=\{mobileNavLinkClass\}[\s\S]*?>[\s\S]*?Job Details[\s\S]*?<\/NavLink>[\s\S]*?\) : null\}/;
code = code.replace(mobileLinkRegex, '');

fs.writeFileSync('frontend/src/components/Navbar.tsx', code, 'utf8');
console.log('Removed Job Details from Navbar');

const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/Navbar.tsx', 'utf8');

// Remove useEffect import if not used elsewhere
code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState } from 'react';");

// Remove jobsAPI import
code = code.replace(/import \{ jobsAPI \} from '\.\.\/api\/jobs';\n/, "");

// Remove the state and fetch logic
const stateLogicRegex = /const \[latestJobId, setLatestJobId\] = useState<string \| null>\(null\);\s*useEffect\(\(\) => \{\s*const fetchDefaultJobId = async \(\) => \{\s*try \{\s*const res = await jobsAPI\.getJobs\(\{ limit: 1 \}\);\s*const jobsList = res\.data \|\| res\.jobs \|\| \[\];\s*if \(jobsList\.length > 0\) \{\s*setLatestJobId\(jobsList\[0\]\._id\);\s*\}\s*\} catch \(err\) \{\s*console\.error\('Navbar: failed to fetch fallback job id', err\);\s*\}\s*\};\s*fetchDefaultJobId\(\);\s*\}, \[\]\);/;

code = code.replace(stateLogicRegex, "");

fs.writeFileSync('frontend/src/components/Navbar.tsx', code, 'utf8');
console.log('Cleaned up Navbar.tsx');

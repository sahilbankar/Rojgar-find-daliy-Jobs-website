const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/Navbar.tsx', 'utf8');

// Add useEffect and jobsAPI
code = code.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");
code = code.replace(/import \{ useAuth \} from '\.\.\/hooks\/useAuth';/, "import { useAuth } from '../hooks/useAuth';\nimport { jobsAPI } from '../api/jobs';");

// Add state and fetcher
const stateLogic = `
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [latestJobId, setLatestJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefaultJobId = async () => {
      try {
        const res = await jobsAPI.getJobs({ limit: 1 });
        const jobsList = res.data || res.jobs || [];
        if (jobsList.length > 0) {
          setLatestJobId(jobsList[0]._id);
        }
      } catch (err) {
        console.error('Navbar: failed to fetch fallback job id', err);
      }
    };
    fetchDefaultJobId();
  }, []);
`;

code = code.replace(/const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\);/, stateLogic);

// Replace static links
// Desktop
code = code.replace(/<NavLink to="\/jobs\/1" className=\{navLinkClass\}>[\s\S]*?<\/NavLink>/, `
            {latestJobId ? (
              <NavLink to={\`/jobs/\${latestJobId}\`} className={navLinkClass}>
                Job Details
              </NavLink>
            ) : null}`);

// Mobile
code = code.replace(/<NavLink[\s]*to="\/jobs\/1"[\s\S]*?className=\{mobileNavLinkClass\}[\s\S]*?onClick=\{\(\) => setIsMobileMenuOpen\(false\)\}[\s\S]*?>[\s\S]*?Job Details[\s\S]*?<\/NavLink>/, `
            {latestJobId ? (
              <NavLink
                to={\`/jobs/\${latestJobId}\`}
                className={mobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Job Details
              </NavLink>
            ) : null}`);

fs.writeFileSync('frontend/src/components/Navbar.tsx', code, 'utf8');
console.log('Fixed Navbar.tsx');

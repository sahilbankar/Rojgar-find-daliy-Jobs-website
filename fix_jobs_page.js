const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/JobsPage.tsx', 'utf8');

// The regex accidentally swallowed imports between 'import {' and 'MapPin,'
// We will manually inject the missing react-router-dom imports
if (!code.includes('react-router-dom')) {
  code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, `import React, { useState, useEffect } from 'react';\nimport { Link, useSearchParams } from 'react-router-dom';\nimport { Search } from 'lucide-react';`);
}

fs.writeFileSync('frontend/src/pages/JobsPage.tsx', code, 'utf8');
console.log('Fixed JobsPage imports');

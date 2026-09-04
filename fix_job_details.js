const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/JobDetailPage.tsx', 'utf8');

// Replace the API call with a wrapped timeout API call to prevent infinite loading
code = code.replace(
  /const res = await jobsAPI\.getJobById\(id\);/g,
  `const res = await Promise.race([
          jobsAPI.getJobById(id),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Job details request timed out after 10 seconds.')), 10000))
        ]);`
);

// Add robust null checks in JSX just in case
code = code.replace(/\{job\.title\}/g, '{job?.title || "Job Title"}');
code = code.replace(/\{job\.location\}/g, '{job?.location || "Location Not Specified"}');
code = code.replace(/\{job\.description\}/g, '{job?.description || "No description provided."}');
code = code.replace(/job\.jobType/g, 'job?.jobType');

fs.writeFileSync('frontend/src/pages/JobDetailPage.tsx', code, 'utf8');
console.log('Fixed JobDetailPage.tsx');

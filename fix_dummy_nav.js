const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/JobDetailPage.tsx', 'utf8');

// Add useNavigate
code = code.replace(/import \{ Link, useParams \} from 'react-router-dom';/, "import { Link, useParams, useNavigate } from 'react-router-dom';");

// Add navigate hook
code = code.replace(/const \{ id \} = useParams<\{ id: string \}>\(\);/, "const { id } = useParams<{ id: string }>();\n  const navigate = useNavigate();");

// Inject interceptor logic for id === '1'
const hookLogic = `
        if (!id) {
          setError('Job ID is missing in the request.');
          setIsLoading(false);
          return;
        }

        let targetId = id;
        if (id === '1') {
          try {
            const jobsListRes = await jobsAPI.getJobs({ limit: 1 });
            const jobsList = jobsListRes.data || jobsListRes.jobs || [];
            if (jobsList.length > 0) {
              targetId = jobsList[0]._id;
              navigate(\`/jobs/\${targetId}\`, { replace: true });
              return; // Component will remount with new ID
            } else {
              setError('No jobs are currently available to display.');
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Failed to fetch fallback job', e);
            setError('Failed to load job data.');
            setIsLoading(false);
            return;
          }
        }
`;

code = code.replace(/if \(!id\) \{[\s\S]*?return;\n\s*\}/, hookLogic);

// We need to pass targetId instead of id to getJobById, though we returned after navigate. 
// But wait, the existing code says `const res = await Promise.race([jobsAPI.getJobById(id), ...])`
code = code.replace(/jobsAPI\.getJobById\(id\)/g, 'jobsAPI.getJobById(targetId)');

fs.writeFileSync('frontend/src/pages/JobDetailPage.tsx', code, 'utf8');
console.log('Fixed JobDetailPage logic');

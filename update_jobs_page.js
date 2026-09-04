const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/JobsPage.tsx', 'utf8');

const jobsMapRegex = /const companyName = job\.companyName \|\| job\.employerId\?\.companyName \|\| 'Company';/;
code = code.replace(jobsMapRegex, `const companyName = job.companyName || job.employerId?.companyName || 'Company';
                const totalVacancies = job.totalVacancies || job.vacancies || 1;
                const remainingVacancies = job.remainingVacancies !== undefined ? job.remainingVacancies : totalVacancies;`);

const gridItemRegex = /<div className="flex items-center space-x-1\.5 col-span-2 sm:col-span-2">[\s\S]*?<DollarSign className="w-4 h-4 text-emerald-600 shrink-0" \/>[\s\S]*?<span className="font-bold text-emerald-700 text-sm">\{formatSalary\(job\)\}<\/span>[\s\S]*?<\/div>/;

code = code.replace(gridItemRegex, `<div className="flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>Vacancies: <strong className="text-gray-900">{remainingVacancies} / {totalVacancies}</strong></span>
                      </div>

                      <div className="flex items-center space-x-1.5 sm:col-span-1">
                        <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-700 text-sm">{formatSalary(job)}</span>
                      </div>`);

// Add Users import
if (!code.includes('Users,')) {
    code = code.replace(/import \{[\s\S]*?MapPin,/, "import {\n  Users,\n  MapPin,");
}

fs.writeFileSync('frontend/src/pages/JobsPage.tsx', code, 'utf8');
console.log('Added vacancies to JobsPage grid');

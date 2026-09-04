const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/JobDetailPage.tsx', 'utf8');

// Update handleApplySubmit to decrement local vacancy count
const applySuccessRegex = /if \(response\.success \|\| response\.data\) \{\s*setApplySuccess\(true\);\s*setShowApplyModal\(false\);\s*\}/;
code = code.replace(applySuccessRegex, `if (response.success || response.data) {
        setApplySuccess(true);
        setShowApplyModal(false);
        // Automatically decrease remaining vacancy count in local state
        setJob((prev: any) => {
          if (!prev) return prev;
          const currentRemaining = prev.remainingVacancies !== undefined ? prev.remainingVacancies : prev.totalVacancies;
          return {
            ...prev,
            remainingVacancies: Math.max(0, currentRemaining - 1)
          };
        });
      }`);

// Prevent applications if remainingVacancies <= 0
// Wait, we need to extract remainingVacancies properly before the return statement
// In the JSX, replace the Apply button logic
const applyButtonLogicRegex = /\{applySuccess \? \([\s\S]*?<div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-200 font-bold text-sm">[\s\S]*?<CheckCircle className="w-5 h-5 text-emerald-600" \/>[\s\S]*?<span>Application Saved to Database!<\/span>[\s\S]*?<\/div>[\s\S]*?\) : \([\s\S]*?<button[\s\S]*?onClick=\{\(\) => setShowApplyModal\(true\)\}[\s\S]*?className="w-full sm:w-auto px-8 py-3\.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"[\s\S]*?>[\s\S]*?Apply Now[\s\S]*?<\/button>[\s\S]*?\)\}/;

code = code.replace(applyButtonLogicRegex, `{applySuccess ? (
                  <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-200 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Application Saved to Database!</span>
                  </div>
                ) : remainingVacancies <= 0 ? (
                  <div className="flex items-center space-x-2 text-red-700 bg-red-50 px-6 py-3 rounded-xl border border-red-200 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span>No Vacancies Remaining</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowApplyModal(true)} 
                    className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
                  >
                    Apply Now
                  </button>
                )}`);

fs.writeFileSync('frontend/src/pages/JobDetailPage.tsx', code, 'utf8');
console.log('Updated JobDetailPage.tsx');

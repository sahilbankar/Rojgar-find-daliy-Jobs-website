const fs = require('fs');
let code = fs.readFileSync('backend/models/Job.js', 'utf8');

// Add remainingVacancies
if (!code.includes('remainingVacancies: {')) {
  code = code.replace(/totalVacancies: \{[\s\S]*?\},/, `totalVacancies: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    remainingVacancies: {
      type: Number,
      default: function() { return this.totalVacancies; },
      min: 0
    },`);
  fs.writeFileSync('backend/models/Job.js', code, 'utf8');
  console.log('Updated Job.js model');
} else {
  console.log('Job.js model already updated');
}

const fs = require('fs');
const path = require('path');

const dir = 'backend/controllers';
fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Add next parameter
        content = content.replace(/async \(req, res\) =>/g, 'async (req, res, next) =>');
        
        // Replace catch blocks 500s with next(error)
        content = content.replace(/res\.status\(500\)\.json\(\{\s*message:\s*error\.message\s*\}\);/g, 'next(error);');
        content = content.replace(/res\.status\(500\)\.json\(\{\s*message:\s*err\.message\s*\}\);/g, 'next(err);');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', file);
    }
});

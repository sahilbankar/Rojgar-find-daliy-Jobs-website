const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldRenderProfileStart = `    const renderProfile = () => {
    const [formData, setFormData] = React.useState({`;

const newRenderProfileStart = `const AdminProfileForm = ({ user }: { user: any }) => {
    const [formData, setFormData] = React.useState({`;

code = code.replace(oldRenderProfileStart, newRenderProfileStart);

const oldRenderProfileEnd = `      </div>
    );
  };`;

const newRenderProfileEnd = `      </div>
    );
};`;
code = code.replace(oldRenderProfileEnd, newRenderProfileEnd);

// Now we need to move AdminProfileForm outside of AdminDashboard.
// Where is AdminProfileForm located? It's currently right above `const navItems = [` inside AdminDashboard.
// So we need to cut it out and put it above `export const AdminDashboard: React.FC = () => {`

const adminDashStart = code.indexOf('export const AdminDashboard: React.FC = () => {');
const formStart = code.indexOf('const AdminProfileForm = ({ user }: { user: any }) => {');
const navItemsStart = code.indexOf('const navItems = [');

if (formStart !== -1 && adminDashStart !== -1 && navItemsStart !== -1) {
    const formCode = code.substring(formStart, navItemsStart);
    // Replace the form in the body with a new renderProfile function
    const replacement = `  const renderProfile = () => <AdminProfileForm user={user} />;\n\n  `;
    code = code.substring(0, formStart) + replacement + code.substring(navItemsStart);
    // Insert the formCode before AdminDashboard
    code = code.substring(0, adminDashStart) + formCode + '\n' + code.substring(adminDashStart);
    fs.writeFileSync(path, code, 'utf8');
    console.log('Fixed renderProfile hooks error');
} else {
    console.log('Could not find markers to extract AdminProfileForm');
}

const fs = require('fs');

const path = 'backend/controllers/userController.js';
let code = fs.readFileSync(path, 'utf8');

const oldUpdate = `    if (name !== undefined) user.name = name;
    if (skills !== undefined) user.skills = skills;
    if (availabilityStatus !== undefined) user.availabilityStatus = availabilityStatus;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (experience !== undefined) user.experience = experience;
    if (req.body.education !== undefined) user.education = req.body.education;

    await user.save();`;

const newUpdate = `    if (name !== undefined) user.name = name;
    if (skills !== undefined) user.skills = skills;
    if (availabilityStatus !== undefined) user.availabilityStatus = availabilityStatus;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (experience !== undefined) user.experience = experience;
    if (req.body.education !== undefined) user.education = req.body.education;

    if (req.body.email !== undefined && req.body.email.trim() !== '') {
      const email = req.body.email.trim().toLowerCase();
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
      user.email = email;
    }

    if (req.body.password && req.body.password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();`;

if (code.includes('if (name !== undefined) user.name = name;')) {
    code = code.replace(oldUpdate, newUpdate);
    fs.writeFileSync(path, code, 'utf8');
    console.log('Backend user profile update expanded for email/password');
} else {
    console.log('Update pattern not found');
}

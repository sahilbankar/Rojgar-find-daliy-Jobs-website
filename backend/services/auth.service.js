const User = require('../models/User');
const Employer = require('../models/Employer');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

class AuthService {
  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    if (!email) return null;
    const normalizedEmail = String(email).trim().toLowerCase();
    return User.findOne({ email: normalizedEmail });
  }

  /**
   * Find user by ID
   */
  async findUserById(id) {
    return User.findById(id).select('-password');
  }

  /**
   * Register a new user
   */
  async registerUser(userData) {
    const { name, email, password, role, phone } = userData;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error = new Error('An account with this email address already exists. Please login instead.');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'jobseeker',
      phone: phone ? phone.trim() : '',
    });

    if (user.role === 'employer') {
      try {
        await Employer.create({
          userId: user._id,
          companyName: user.name,
          phone: user.phone || '',
        });
      } catch (empErr) {
        console.warn('Employer profile auto-creation notice:', empErr.message);
      }
    }

    return user;
  }

  /**
   * Verify user password
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate access and refresh tokens for user
   */
  generateAuthTokens(user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();

const User = require('../models/User');

class UserService {
  /**
   * Get user profile by ID
   */
  async getUserById(id) {
    return User.findById(id).select('-password');
  }

  /**
   * Update user profile by ID
   */
  async updateUserProfile(id, updateData) {
    // Exclude password from general profile update
    delete updateData.password;
    delete updateData.role;

    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');
  }

  /**
   * Get all users (Admin view)
   */
  async getAllUsers(filter = {}) {
    return User.find(filter).select('-password').sort({ createdAt: -1 });
  }

  /**
   * Toggle block/unblock status for a user
   */
  async toggleBlockUser(id) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'admin') {
      const error = new Error('Cannot block an admin user');
      error.statusCode = 400;
      throw error;
    }

    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });
    return user;
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'admin') {
      const error = new Error('Cannot delete an admin user');
      error.statusCode = 400;
      throw error;
    }

    return User.findByIdAndDelete(id);
  }
}

module.exports = new UserService();

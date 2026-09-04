const jwt = require('jsonwebtoken');

// Generate short-lived Access Token (15m default)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'rojgar_access_token_super_secret_key_2026_x9a8f7b6',
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

// Generate long-lived Refresh Token (7d default)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'rojgar_refresh_token_super_secret_key_2026_k1m2n3p4',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// Send dual token response and set cookies
const sendTokenResponse = async (user, statusCode, res, message = 'Authentication successful') => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token in user document (maintaining recent 10 sessions max)
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
  if (user.refreshTokens.length > 10) {
    user.refreshTokens = user.refreshTokens.slice(-10);
  }
  await user.save({ validateBeforeSave: false });

  // Cookie options
  const isProduction = process.env.NODE_ENV === 'production';
  const refreshCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    path: '/'
  };

  const accessCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    path: '/'
  };

  res
    .status(statusCode)
    .cookie('token', accessToken, accessCookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json({
      success: true,
      message,
      accessToken,
      refreshToken,
      token: accessToken, // backward compatibility
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        skills: user.skills,
        location: user.location,
        education: user.education,
        experience: user.experience,
        availabilityStatus: user.availabilityStatus
      },
    });
};

module.exports = sendTokenResponse;
module.exports.generateAccessToken = generateAccessToken;
module.exports.generateRefreshToken = generateRefreshToken;
module.exports.sendTokenResponse = sendTokenResponse;


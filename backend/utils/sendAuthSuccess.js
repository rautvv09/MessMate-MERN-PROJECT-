const { generateAccessToken, generateRefreshToken } = require('./generateTokens');
const { accessTokenCookieOptions, refreshTokenCookieOptions } = require('./cookieOptions');

const sendAuthSuccess = async (user, res, statusCode) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Persist this refresh token in the user's array — this is what lets us
  // individually revoke it later (single-device logout) without invalidating
  // every other active session
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);

  // Defensive cap: prevent unbounded growth of this array for an account that
  // logs in from many devices/browsers over a long lifetime without ever
  // properly logging out everywhere
  const MAX_SESSIONS = 10;
  if (user.refreshTokens.length > MAX_SESSIONS) {
    user.refreshTokens = user.refreshTokens.slice(-MAX_SESSIONS);
  }

  await user.save({ validateBeforeSave: false });

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  res.status(statusCode).json({
    success: true,
    data: { user: user.toSafeObject() },
    // Tokens are intentionally NOT included in the JSON body — they exist only
    // as httpOnly cookies, unreadable by frontend JavaScript by design
  });
};

module.exports = sendAuthSuccess;
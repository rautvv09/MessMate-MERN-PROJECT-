const config = require('../config/env');

const isProduction = config.nodeEnv === 'production';
const sameSitePolicy = isProduction ? 'none' : 'lax';

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction, // mandatory when sameSite is 'none' in production
  sameSite: sameSitePolicy,
  maxAge: 15 * 60 * 1000, // 15 minutes, matching JWT_ACCESS_EXPIRES_IN
  path: '/',
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: sameSitePolicy,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matching JWT_REFRESH_EXPIRES_IN
  path: '/api/auth/refresh', // this cookie is only ever sent back on the refresh endpoint itself
};

module.exports = { accessTokenCookieOptions, refreshTokenCookieOptions };
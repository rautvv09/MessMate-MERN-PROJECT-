const googleClient = require('../config/googleClient');
const config = require('../config/env');
const AppError = require('./AppError');

const verifyGoogleToken = async (idToken) => {
  if (!config.google.clientId) {
    console.error('[Google OAuth Error] GOOGLE_CLIENT_ID is not configured in backend environment variables.');
    throw new AppError('Server configuration error: GOOGLE_CLIENT_ID is missing on backend', 500);
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });
  } catch (error) {
    console.error('[Google OAuth Verification Failed]', error.message);
    throw new AppError('Invalid or expired Google token', 401);
  }

  const payload = ticket.getPayload();

  if (!payload) {
    throw new AppError('Could not verify Google account payload', 401);
  }

  if (!payload.email_verified) {
    throw new AppError('Google account email is not verified', 401);
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatarUrl: payload.picture,
  };
};

module.exports = verifyGoogleToken;
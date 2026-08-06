const googleClient = require('../config/googleClient');
const config = require('../config/env');
const AppError = require('./AppError');

const verifyGoogleToken = async (idToken) => {
  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });
  } catch (error) {
    throw new AppError('Invalid or expired Google token', 401);
  }

  const payload = ticket.getPayload();

  if (!payload) {
    throw new AppError('Could not verify Google account', 401);
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
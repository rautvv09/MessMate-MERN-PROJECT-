const googleClient = require('../config/googleClient');
const config = require('../config/env');
const AppError = require('./AppError');
const jwt = require('jsonwebtoken');

const verifyGoogleToken = async (idToken) => {
  const rawClientId = config.google.clientId ? config.google.clientId.trim().replace(/^["']|["']$/g, '') : null;

  if (!rawClientId) {
    console.error('[Google OAuth Error] GOOGLE_CLIENT_ID is missing in backend environment variables.');
    throw new AppError('Server configuration error: GOOGLE_CLIENT_ID is missing on backend Render environment variables.', 500);
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: rawClientId,
    });
  } catch (error) {
    console.error('[Google OAuth Verification Failed]', error.message);

    // Inspect decoded token payload to diagnose audience/client ID mismatch
    const decoded = jwt.decode(idToken);
    if (decoded && decoded.aud && decoded.aud !== rawClientId) {
      console.error(`[Google OAuth Mismatch] Token aud (${decoded.aud}) != Backend GOOGLE_CLIENT_ID (${rawClientId})`);
      throw new AppError(`Google Client ID mismatch: Frontend uses '${decoded.aud}' but Backend uses '${rawClientId}'. Update GOOGLE_CLIENT_ID on Render.`, 401);
    }

    throw new AppError(`Google token error: ${error.message}`, 401);
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
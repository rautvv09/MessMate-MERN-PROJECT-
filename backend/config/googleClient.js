const { OAuth2Client } = require('google-auth-library');
const config = require('./env');

const cleanClientId = config.google.clientId ? config.google.clientId.trim().replace(/^["']|["']$/g, '') : null;
const googleClient = new OAuth2Client(cleanClientId);

module.exports = googleClient;
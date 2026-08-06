const { OAuth2Client } = require('google-auth-library');
const config = require('./env');

const googleClient = new OAuth2Client(config.google.clientId);

module.exports = googleClient;
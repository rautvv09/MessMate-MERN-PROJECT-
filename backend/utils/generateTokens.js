const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
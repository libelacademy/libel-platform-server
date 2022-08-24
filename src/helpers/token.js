/** @format */

const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiration } = require('../config');

const generateToken = (user, expired='') => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  const options = {
    expiresIn: expired ? expired : jwtExpiration,
  };
  return jwt.sign(payload, jwtSecret, options);
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };

/** @format */

const bcrypt = require('bcrypt');
const { saltRounds } = require('../config');

const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

const comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

module.exports = { hashPassword, comparePassword };

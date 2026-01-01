const { register } = require('./register.mutation');
const { login } = require('./login.mutation');
const { updateUser } = require('./users/update.mutation');
const { loginWithToken } = require('./loginToken.mutation');
const { generateLoginToken } = require('./generateToken.mutation');

module.exports = {
  register,
  login,
  updateUser,
  loginWithToken,
  generateLoginToken,
};

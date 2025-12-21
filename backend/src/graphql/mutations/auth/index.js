const { register } = require('./register.mutation');
const { login } = require('./login.mutation');
const { updateUser } = require('./users/update.mutation');

module.exports = {
  register,
  login,
  updateUser,
};

const { register } = require('./register.mutation');
const { login } = require('./login.mutation');
const { updateUser } = require('./users/update.mutation');
const { saveExpoPushToken } = require('./users/saveToken.mutation');

module.exports = {
  register,
  login,
  updateUser,
  saveExpoPushToken,
};

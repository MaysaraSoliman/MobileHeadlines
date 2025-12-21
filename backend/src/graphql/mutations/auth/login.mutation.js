const { comparePassword } = require('../../../utils/auth');
const { getToken } = require('../../../utils/jwt');

const login = async (parent, { input }, context) => {
  const user = await context.prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }

  const token = getToken(user.id);

  return {
    token,
    user,
  };
};

module.exports = {
  login,
};

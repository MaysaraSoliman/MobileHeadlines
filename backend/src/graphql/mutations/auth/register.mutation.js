const { hashPassword } = require('../../../utils/auth');
const { getToken } = require('../../../utils/jwt');

const register = async (parent, { input }, context) => {
  const { email, password, name } = input;
  const existingUser = await context.prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (existingUser) {
    throw new Error('Email already registered');
  }
  const hashedPassword = await hashPassword(password);
  const user = await context.prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  const token = getToken(user.id);

  return {
    token,
    user,
  };
};

module.exports = {
  register,
};

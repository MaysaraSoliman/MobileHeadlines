const dayjs = require('dayjs');
const { getToken } = require('../../../utils/jwt');

const loginWithToken = async (_, { token }, { prisma }) => {
  const loginToken = await prisma.loginToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!loginToken) {
    throw new Error('Invalid login token');
  }

  if (loginToken.usedAt) {
    throw new Error('Token already used');
  }

  if (dayjs().isAfter(dayjs(loginToken.expiresAt))) {
    throw new Error('Token expired');
  }

  // Mark as used
  await prisma.loginToken.update({
    where: { id: loginToken.id },
    data: { usedAt: new Date() },
  });

  // Generate JWT
  const jwt = getToken(loginToken.user.id);

  return {
    token: jwt,
    user: loginToken.user,
  };
};

module.exports = { loginWithToken };

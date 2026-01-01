const crypto = require('node:crypto');
const dayjs = require('dayjs');

const generateLoginToken = async (_, { userId }, { prisma, user: authUser }) => {
  console.log('generateLoginToken called with userId:', userId);
  console.log('Authenticated user:', authUser ? authUser.id : 'none');

  if (!authUser) {
    throw new Error('Not authenticated');
  }

  // If generating for someone else, must be ADMIN
  if (userId !== authUser.id && authUser.role !== 'ADMIN') {
    throw new Error('Not authorized to generate token for other users');
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = dayjs().add(10, 'minute').toDate(); // 10 minutes expiry

  await prisma.loginToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

module.exports = { generateLoginToken };

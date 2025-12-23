const me = async (parent, args, context) => {
  if (!context.userId) {
    throw new Error('Not authenticated');
  }
  return context.prisma.user.findUnique({
    where: { id: context.userId },
  });
};

const users = async (_, { role }, { prisma }) => {
  const where = role ? { role } : {};
  return await prisma.user.findMany({
    where,
    orderBy: { name: 'asc' }
  });
};

module.exports = {
  me,
  users
};

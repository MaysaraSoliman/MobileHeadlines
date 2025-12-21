const me = async (parent, args, context) => {
  if (!context.userId) {
    throw new Error('Not authenticated');
  }
  return context.prisma.user.findUnique({
    where: { id: context.userId },
  });
};

module.exports = {
  me,
};

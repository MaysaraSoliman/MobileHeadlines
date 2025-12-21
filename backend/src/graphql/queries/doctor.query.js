const doctors = async (parent, args, context) => {
  const { prisma } = context;
  const allDoctors = await prisma.doctor.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return allDoctors.map((doc) => ({
    ...doc,
    createdAt: doc.createdAt.toISOString(),
  }));
};

module.exports = { doctors };

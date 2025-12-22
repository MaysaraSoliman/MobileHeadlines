const patients = async (_, { search }, context) => {
  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  return await context.prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

module.exports = { patients };

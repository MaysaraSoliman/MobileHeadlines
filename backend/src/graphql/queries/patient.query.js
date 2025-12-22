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

const patient = async (_, { id }, context) => {
  const patient = await context.prisma.patient.findUnique({
    where: { id },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient;
};

module.exports = { patients, patient };

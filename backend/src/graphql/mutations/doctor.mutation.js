const createDoctor = async (parent, { input }, context) => {
  const { name, specialty, email, phone } = input;
  const { prisma } = context;

  const existingDoctor = await prisma.doctor.findUnique({
    where: { email },
  });

  if (existingDoctor) {
    throw new Error('Doctor with this email already exists');
  }

  const doctor = await prisma.doctor.create({
    data: {
      name,
      specialty,
      email,
      phone,
    },
  });

  return {
    ...doctor,
    createdAt: doctor.createdAt.toISOString(),
  };
};

module.exports = { createDoctor };

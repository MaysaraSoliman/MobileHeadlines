const createPerson = async (_, { input }, { prisma }) => {
  // Validate company exists
  const company = await prisma.company.findUnique({
    where: { id: input.companyId }
  });
  if (!company) {
    throw new Error('Company not found');
  }

  return await prisma.person.create({
    data: input,
    include: {
      company: true
    }
  });
};

const updatePerson = async (_, { input }, { prisma }) => {
  const { id, ...data } = input;
  return await prisma.person.update({
    where: { id },
    data,
    include: {
      company: true
    }
  });
};

module.exports = {
  createPerson,
  updatePerson
};

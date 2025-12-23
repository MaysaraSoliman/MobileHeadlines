const createCompany = async (_, { input }, { prisma }) => {
  return await prisma.company.create({
    data: input
  });
};

const updateCompany = async (_, { input }, { prisma }) => {
  const { id, ...data } = input;
  return await prisma.company.update({
    where: { id },
    data
  });
};

module.exports = {
  createCompany,
  updateCompany
};

const createDeal = async (_, { input }, { prisma }) => {
  // Validate company exists
  const company = await prisma.company.findUnique({
    where: { id: input.companyId }
  });
  if (!company) {
    throw new Error('Company not found');
  }

  return await prisma.deal.create({
    data: input,
    include: {
      company: true
    }
  });
};

module.exports = {
  createDeal
};

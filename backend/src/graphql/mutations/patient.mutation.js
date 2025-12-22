const createPatient = async (_, { input }, context) => {
  const { firstName, lastName, email, phone } = input;
  
  try {
    const patient = await context.prisma.patient.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
    });
    return patient;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Patient with this email already exists');
    }
    throw error;
  }
};

module.exports = { createPatient };

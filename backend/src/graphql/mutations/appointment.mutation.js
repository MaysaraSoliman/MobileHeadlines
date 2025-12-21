const createAppointment = async (parent, { input }, context) => {
  const { doctorId, date, startTime, endTime } = input;
  const { prisma } = context;

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const appointment = await prisma.appointment.create({
    data: {
      doctorId,
      date: new Date(date),
      startTime,
      endTime,
      status: 'PENDING',
    },
    include: {
      doctor: true,
    },
  });

  return {
    ...appointment,
    date: appointment.date.toISOString(),
    createdAt: appointment.createdAt.toISOString(),
    doctor: {
      ...appointment.doctor,
      createdAt: appointment.doctor.createdAt.toISOString(),
    },
  };
};

module.exports = { createAppointment };

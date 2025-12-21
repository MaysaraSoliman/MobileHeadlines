const appointments = async (parent, args, context) => {
  const { prisma } = context;
  const allAppointments = await prisma.appointment.findMany({
    include: {
      doctor: true,
    },
    orderBy: { date: 'asc' },
  });

  return allAppointments.map((appt) => ({
    ...appt,
    date: appt.date.toISOString(),
    createdAt: appt.createdAt.toISOString(),
    doctor: {
      ...appt.doctor,
      createdAt: appt.doctor.createdAt.toISOString(),
    },
  }));
};

module.exports = { appointments };

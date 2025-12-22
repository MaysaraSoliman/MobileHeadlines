const appointments = async (parent, args, context) => {
  const { prisma } = context;
  const allAppointments = await prisma.appointment.findMany({
    include: {
      doctor: true,
      patient: true,
    },
    orderBy: { date: "asc" },
  });

  return allAppointments.map((appt) => ({
    ...appt,
    date: appt.date.toISOString(),
    createdAt: appt.createdAt.toISOString(),
    doctor: {
      ...appt.doctor,
      createdAt: appt.doctor.createdAt.toISOString(),
    },
    patient: {
      ...appt.patient,
      createdAt: appt.patient.createdAt.toISOString(),
    },
  }));
};

const appointmentsByDate = async (parent, { date }, context) => {
  const { prisma } = context;
  const searchDate = new Date(date);
  const startOfDay = new Date(searchDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(searchDate);
  endOfDay.setHours(23, 59, 59, 999);

  const foundAppointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      doctor: true,
      patient: true,
    },
    orderBy: { startTime: "asc" },
  });

  return foundAppointments.map((appt) => ({
    ...appt,
    date: appt.date.toISOString(),
    createdAt: appt.createdAt.toISOString(),
    doctor: {
      ...appt.doctor,
      createdAt: appt.doctor.createdAt.toISOString(),
    },
    patient: {
      ...appt.patient,
      createdAt: appt.patient.createdAt.toISOString(),
    },
  }));
};

const appointment = async (parent, { id }, context) => {
  const { prisma } = context;
  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!appt) {
    throw new Error("Appointment not found");
  }

  return {
    ...appt,
    date: appt.date.toISOString(),
    createdAt: appt.createdAt.toISOString(),
    doctor: {
      ...appt.doctor,
      createdAt: appt.doctor.createdAt.toISOString(),
    },
    patient: {
      ...appt.patient,
      createdAt: appt.patient.createdAt.toISOString(),
    },
  };
};

module.exports = { appointments, appointmentsByDate, appointment };

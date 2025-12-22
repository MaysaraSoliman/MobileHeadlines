const createAppointment = async (parent, { input }, context) => {
  const { doctorId, patientId, date, startTime, endTime } = input;
  const { prisma } = context;

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  // Validate Time
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  if (startTotal >= endTotal) {
    throw new Error('Start time must be before end time');
  }

  // Check Overlap
  const appointmentDate = new Date(date);
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { not: 'CANCELED' },
    },
  });

  const hasOverlap = existingAppointments.some((appt) => {
    const [apptStartH, apptStartM] = appt.startTime.split(':').map(Number);
    const [apptEndH, apptEndM] = appt.endTime.split(':').map(Number);
    const apptStart = apptStartH * 60 + apptStartM;
    const apptEnd = apptEndH * 60 + apptEndM;

    return startTotal < apptEnd && endTotal > apptStart;
  });

  if (hasOverlap) {
    throw new Error('Doctor is not available at this time');
  }

  const appointment = await prisma.appointment.create({
    data: {
      doctorId,
      patientId,
      date: appointmentDate,
      startTime,
      endTime,
      status: 'PENDING',
    },
    include: {
      doctor: true,
      patient: true,
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
    patient: {
      ...appointment.patient,
      createdAt: appointment.patient.createdAt.toISOString(),
    },
  };
};

const updateAppointment = async (parent, { input }, context) => {
  const { id, date, startTime, endTime, status } = input;
  const { prisma } = context;

  const existingAppt = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existingAppt) {
    throw new Error('Appointment not found');
  }

  const newStartTime = startTime || existingAppt.startTime;
  const newEndTime = endTime || existingAppt.endTime;

  // Validate Time
  const [startH, startM] = newStartTime.split(':').map(Number);
  const [endH, endM] = newEndTime.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  if (startTotal >= endTotal) {
    throw new Error('Start time must be before end time');
  }

  const dataToUpdate = {};
  if (status) dataToUpdate.status = status;
  if (date) dataToUpdate.date = new Date(date);
  if (startTime) dataToUpdate.startTime = startTime;
  if (endTime) dataToUpdate.endTime = endTime;

  // If time is changing, simple overlap check could be added here similar to create
  // For now, simple update

  const appointment = await prisma.appointment.update({
    where: { id },
    data: dataToUpdate,
    include: {
      doctor: true,
      patient: true,
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
    patient: {
      ...appointment.patient,
      createdAt: appointment.patient.createdAt.toISOString(),
    },
  };
};

module.exports = { createAppointment, updateAppointment };

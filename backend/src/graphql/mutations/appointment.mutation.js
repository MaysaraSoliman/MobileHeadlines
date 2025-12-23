const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const formatAppointment = (appt) => {
  if (!appt) return null;
  return {
    ...appt,
    date: appt.date instanceof Date ? appt.date.toISOString() : appt.date,
    createdAt: appt.createdAt instanceof Date ? appt.createdAt.toISOString() : appt.createdAt,
    updatedAt: appt.updatedAt instanceof Date ? appt.updatedAt.toISOString() : appt.updatedAt,
  };
};

const createAppointment = async (_, { input }, { prisma }) => {
  const { companyId, personId, userId, date, startTime, endTime } = input;

  // Validate Company
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error('Company not found');

  // Validate Person (and check if belongs to company)
  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) throw new Error('Person not found');
  if (person.companyId !== companyId) throw new Error('Person does not belong to this company');

  // Validate User
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  // Optional: check if user is a DOCTOR if strict role enforcement is needed
  // if (user.role !== 'DOCTOR') throw new Error('User is not a doctor');

  const appt = await prisma.appointment.create({
    data: {
      companyId,
      personId,
      userId,
      date: new Date(date),
      startTime,
      endTime,
      status: 'PENDING'
    },
    include: {
      company: true,
      person: true,
      user: true
    }
  });
  return formatAppointment(appt);
};

const updateAppointmentStatus = async (_, { input }, { prisma }) => {
  const { id, status } = input;
  const appt = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: {
      company: true,
      person: true,
      user: true
    }
  });
  return formatAppointment(appt);
};

const updateAppointment = async (_, { input }, { prisma }) => {
  const { id, date, ...rest } = input;
  const data = { ...rest };
  if (date) {
    // Ensure date is treated as UTC
    data.date = dayjs.utc(date).toDate();
  }

  const appt = await prisma.appointment.update({
    where: { id },
    data,
    include: {
      company: true,
      person: true,
      user: true
    }
  });
  return formatAppointment(appt);
};

const deleteAppointment = async (_, { id }, { prisma }) => {
  const appt = await prisma.appointment.delete({
    where: { id },
    include: {
      company: true,
      person: true,
      user: true
    }
  });
  return formatAppointment(appt);
};

module.exports = {
  createAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment
};

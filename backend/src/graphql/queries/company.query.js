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

const companies = async (_, { search }, { prisma }) => {
  const where = search
    ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }
    : {};

  const companies = await prisma.company.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      persons: true,
      deals: true,
      appointments: {
        include: {
          user: true,
          person: true,
          company: true
        }
      }
    }
  });

  return companies.map(company => ({
    ...company,
    appointments: company.appointments.map(formatAppointment)
  }));
};

const company = async (_, { id }, { prisma }) => {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      persons: true,
      deals: true,
      appointments: true
    }
  });

  if (!company) return null;

  return {
    ...company,
    appointments: company.appointments.map(formatAppointment)
  };
};

const personsByCompany = async (_, { companyId, search }, { prisma }) => {
  const where = { companyId };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  return await prisma.person.findMany({
    where,
    orderBy: { firstName: 'asc' },
    include: {
      company: true
    }
  });
};

const appointmentsByCompany = async (_, { companyId, date }, { prisma }) => {
  const where = { companyId };

  if (date) {
    // Treat date as UTC day start/end
    const startOfDay = dayjs.utc(date).startOf('day').toDate();
    const endOfDay = dayjs.utc(date).endOf('day').toDate();
    where.date = {
      gte: startOfDay,
      lte: endOfDay
    };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { date: 'asc' },
    include: {
      company: true,
      person: true,
      user: true
    }
  });

  return appointments.map(formatAppointment);
};

// Legacy support
const persons = async (_, __, { prisma }) => {
  return await prisma.person.findMany({
    orderBy: { firstName: 'asc' },
    include: { company: true }
  });
};

const appointments = async (_, { date }, { prisma }) => {
  const where = {};

  if (date) {
    const startOfDay = dayjs.utc(date).startOf('day').toDate();
    const endOfDay = dayjs.utc(date).endOf('day').toDate();
    where.date = {
      gte: startOfDay,
      lte: endOfDay
    };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { date: 'asc' },
    include: { company: true, person: true, user: true }
  });
  return appointments.map(formatAppointment);
};

const appointment = async (_, { id }, { prisma }) => {
  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { company: true, person: true, user: true }
  });
  if (!appt) throw new Error('Appointment not found');
  return formatAppointment(appt);
};

module.exports = {
  companies,
  company,
  personsByCompany,
  appointmentsByCompany,
  persons,
  appointments,
  appointment
};

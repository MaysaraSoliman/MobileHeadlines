const authMutations = require('./auth');
const { createCompany, updateCompany } = require('./company.mutation');
const { createPerson, updatePerson } = require('./person.mutation');
const { createDeal } = require('./deal.mutation');
const { createAppointment, updateAppointmentStatus, updateAppointment, deleteAppointment } = require('./appointment.mutation');

module.exports = {
  Mutation: {
    ...authMutations,
    createCompany,
    updateCompany,
    createPerson,
    updatePerson,
    createDeal,
    createAppointment,
    updateAppointmentStatus,
    updateAppointment,
    deleteAppointment,
  },
};

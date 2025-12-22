const authMutations = require('./auth');
const { createDoctor } = require('./doctor.mutation');
const { createAppointment, updateAppointment } = require('./appointment.mutation');
const { createPatient, updatePatient } = require('./patient.mutation');

module.exports = {
  Mutation: {
    ...authMutations,
    createDoctor,
    createAppointment,
    updateAppointment,
    createPatient,
    updatePatient,

  },
};

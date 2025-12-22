const authMutations = require('./auth');
const { createDoctor } = require('./doctor.mutation');
const { createAppointment } = require('./appointment.mutation');
const { createPatient } = require('./patient.mutation');

module.exports = {
  Mutation: {
    ...authMutations,
    createDoctor,
    createAppointment,
    createPatient,
  },
};

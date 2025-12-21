const authMutations = require('./auth');
const { createDoctor } = require('./doctor.mutation');
const { createAppointment } = require('./appointment.mutation');

module.exports = {
  Mutation: {
    ...authMutations,
    createDoctor,
    createAppointment,
  },
};

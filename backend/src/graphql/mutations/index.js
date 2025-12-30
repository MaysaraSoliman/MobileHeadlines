const authMutations = require('./auth');
const { createCompany, updateCompany } = require('./company.mutation');
const { createPerson, updatePerson } = require('./person.mutation');
const { createDeal } = require('./deal.mutation');
const { createAppointment, updateAppointmentStatus, updateAppointment, deleteAppointment } = require('./appointment.mutation');
const { createTask, updateTask, deleteTask } = require('./task.mutation');
const { registerPushToken } = require('./user.mutation');

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
    createTask,
    updateTask,
    deleteTask,
    registerPushToken
  },
};

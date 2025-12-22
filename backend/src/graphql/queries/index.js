const { me } = require('./me.query');
const { doctors } = require('./doctor.query');
const { appointments, appointmentsByDate, appointment } = require('./appointment.query');
const { patients, patient } = require('./patient.query');

module.exports = {
  Query: {
    me,
    doctors,
    appointments,
    appointmentsByDate,
    appointment,
    patients,
    patient,
  },
};

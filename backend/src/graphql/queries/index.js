const { me } = require('./me.query');
const { doctors } = require('./doctor.query');
const { appointments, appointmentsByDate } = require('./appointment.query');
const { patients } = require('./patient.query');

module.exports = {
  Query: {
    me,
    doctors,
    appointments,
    appointmentsByDate,
    patients,
  },
};

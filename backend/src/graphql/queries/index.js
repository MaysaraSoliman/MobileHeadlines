const { me } = require('./me.query');
const { doctors } = require('./doctor.query');
const { appointments } = require('./appointment.query');

module.exports = {
  Query: {
    me,
    doctors,
    appointments,
  },
};

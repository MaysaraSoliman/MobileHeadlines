const { me, users } = require('./user.query');
const { companies, company, personsByCompany, appointmentsByCompany, persons, appointments, appointment } = require('./company.query');

module.exports = {
  Query: {
    me,
    users,
    companies,
    company,
    personsByCompany,
    appointmentsByCompany,
    persons,
    appointments,
    appointment
  },
};

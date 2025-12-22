import { gql } from "@apollo/client";

export const GET_DOCTORS = gql`
  query GetDoctors {
    doctors {
      id
      name
      specialty
      email
      phone
    }
  }
`;

export const GET_PATIENTS = gql`
  query GetPatients($search: String) {
    patients(search: $search) {
      id
      firstName
      lastName
      email
      phone
    }
  }
`;

export const GET_APPOINTMENTS_BY_DATE = gql`
  query GetAppointmentsByDate($date: String!) {
    appointmentsByDate(date: $date) {
      id
      date
      startTime
      endTime
      status
      doctor {
        id
        name
        specialty
      }
      patient {
        id
        firstName
        lastName
        phone
      }
    }
  }
`;

export const GET_APPOINTMENTS = gql`
  query GetAppointments {
    appointments {
      id
      date
      startTime
      endTime
      status
      doctor {
        id
        name
        specialty
      }
      patient {
        id
        firstName
        lastName
      }
    }
  }
`;

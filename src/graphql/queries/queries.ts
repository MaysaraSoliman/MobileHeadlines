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

export const GET_PATIENT = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      firstName
      lastName
      email
      phone
      createdAt
    }
  }
`;

export const GET_APPOINTMENT = gql`
  query GetAppointment($id: ID!) {
    appointment(id: $id) {
      id
      date
      startTime
      endTime
      status
      doctor {
        id
        name
        specialty
        email
        phone
      }
      patient {
        id
        firstName
        lastName
        email
        phone
      }
    }
  }
`;

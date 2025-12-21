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
    }
  }
`;

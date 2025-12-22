import { gql } from "@apollo/client";

const updateUserMutation = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`;

const createAppointmentMutation = gql`
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
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

const createPatientMutation = gql`
  mutation CreatePatient($input: CreatePatientInput!) {
    createPatient(input: $input) {
      id
      firstName
      lastName
      phone
      email
    }
  }
`;

export { updateUserMutation, createAppointmentMutation, createPatientMutation };

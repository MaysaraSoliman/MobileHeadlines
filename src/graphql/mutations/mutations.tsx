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
    }
  }
`;

export { updateUserMutation, createAppointmentMutation };

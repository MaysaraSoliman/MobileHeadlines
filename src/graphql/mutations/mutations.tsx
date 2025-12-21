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

export { updateUserMutation };

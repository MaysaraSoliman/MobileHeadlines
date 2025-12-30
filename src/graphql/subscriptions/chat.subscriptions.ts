import { gql } from "@apollo/client";

export const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription MessageReceived($userId: ID!) {
    messageReceived(userId: $userId) {
      id
      content
      createdAt
      chat {
        id
        name
      }
      sender {
        id
        name
      }
    }
  }
`;

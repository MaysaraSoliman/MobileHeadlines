import { gql } from "@apollo/client";

export const CREATE_COMPANY = gql`
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) {
      id
      name
      email
      phone
    }
  }
`;

export const UPDATE_COMPANY = gql`
  mutation UpdateCompany($input: UpdateCompanyInput!) {
    updateCompany(input: $input) {
      id
      name
      email
      phone
    }
  }
`;

export const CREATE_PERSON = gql`
  mutation CreatePerson($input: CreatePersonInput!) {
    createPerson(input: $input) {
      id
      firstName
      lastName
      email
      phone
      role
      notes
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
      id
      firstName
      lastName
      email
      phone
      role
      notes
    }
  }
`;

export const CREATE_DEAL = gql`
  mutation CreateDeal($input: CreateDealInput!) {
    createDeal(input: $input) {
      id
      title
      amount
      status
    }
  }
`;

export const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
      id
      date
      startTime
      endTime
      status
      user {
        id
        name
        role
      }
      person {
        id
        firstName
        lastName
      }
      company {
        id
        name
      }
    }
  }
`;

export const UPDATE_APPOINTMENT_STATUS = gql`
  mutation UpdateAppointmentStatus($input: UpdateAppointmentStatusInput!) {
    updateAppointmentStatus(input: $input) {
      id
      status
    }
  }
`;

export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($input: UpdateAppointmentInput!) {
    updateAppointment(input: $input) {
      id
      date
      startTime
      endTime
      status
      user {
        id
        name
      }
      person {
        id
        firstName
        lastName
      }
      company {
        id
        name
      }
    }
  }
`;

export const DELETE_APPOINTMENT = gql`
  mutation DeleteAppointment($id: ID!) {
    deleteAppointment(id: $id) {
      id
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
      priority
      dueDate
      assignedToId
      assignedTo {
        id
        name
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      title
      description
      status
      priority
      dueDate
      assignedToId
      assignedTo {
        id
        name
      }
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;

export const SAVE_EXPO_PUSH_TOKEN = gql`
  mutation SaveExpoPushToken($token: String!) {
    saveExpoPushToken(token: $token)
  }
`;

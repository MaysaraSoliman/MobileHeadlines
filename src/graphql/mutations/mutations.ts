import { gql } from "@apollo/client";

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      priority
      status
      dueDate
      assignedTo {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      title
      description
      priority
      status
      dueDate
      assignedTo {
        id
        name
        email
      }
      updatedAt
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const updatePatientMutation = gql`
  mutation UpdatePatient($id: ID!, $input: UpdatePatientInput!) {
    updatePatient(id: $id, input: $input) {
      id
      firstName
      lastName
      phone
      email
      role
      notes
    }
  }
`;

export const updateUserMutation = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const SAVE_EXPO_PUSH_TOKEN = gql`
  mutation SaveExpoPushToken($token: String!) {
    saveExpoPushToken(token: $token)
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
    }
  }
`;

export const DELETE_APPOINTMENT = gql`
  mutation DeleteAppointment($id: ID!) {
    deleteAppointment(id: $id)
  }
`;

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

export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($input: UpdateAppointmentInput!) {
    updateAppointment(input: $input) {
      id
      date
      startTime
      endTime
      status
    }
  }
`;

export const UPDATE_APPOINTMENT_STATUS = UPDATE_APPOINTMENT;

export const createPatientMutation = gql`
  mutation CreatePatient($input: CreatePatientInput!) {
    createPatient(input: $input) {
      id
      firstName
      lastName
      phone
      email
      role
      notes
    }
  }
`;

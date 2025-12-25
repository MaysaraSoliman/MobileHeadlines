import { gql } from "@apollo/client";

export const GET_ME = gql`
  query Me {
    me {
      id
      email
      name
      role
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($role: UserRole) {
    users(role: $role) {
      id
      name
      email
      role
    }
  }
`;

export const GET_COMPANIES = gql`
  query GetCompanies($search: String) {
    companies(search: $search) {
      id
      name
      email
      phone
      persons {
        id
        firstName
        lastName
      }
    }
  }
`;

export const GET_COMPANY = gql`
  query GetCompany($id: ID!) {
    company(id: $id) {
      id
      name
      email
      phone
      persons {
        id
        firstName
        lastName
        email
        phone
      }
      deals {
        id
        title
        amount
        status
      }
      appointments {
        id
      }
    }
  }
`;

export const GET_PERSONS_BY_COMPANY = gql`
  query GetPersonsByCompany($companyId: ID!, $search: String) {
    personsByCompany(companyId: $companyId, search: $search) {
      id
      firstName
      lastName
      email
      phone
    }
  }
`;

export const GET_APPOINTMENTS_BY_COMPANY = gql`
  query GetAppointmentsByCompany($companyId: ID!, $date: String) {
    appointmentsByCompany(companyId: $companyId, date: $date) {
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

export const GET_PATIENTS = gql`
  query GetPatients {
    persons {
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

export const GET_TASKS = gql`
  query GetTasks($filter: TaskFilterInput) {
    tasks(filter: $filter) {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
      createdById
      createdBy {
        id
        name
      }
      assignedToId
      assignedTo {
        id
        name
      }
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
      updatedAt
      createdById
      createdBy {
        id
        name
      }
      assignedToId
      assignedTo {
        id
        name
      }
    }
  }
`;

export const GET_APPOINTMENTS = gql`
  query GetAppointments($date: String) {
    appointments(date: $date) {
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

export const GET_APPOINTMENT = gql`
  query GetAppointment($id: ID!) {
    appointment(id: $id) {
      id
      date
      startTime
      endTime
      status
      user {
        id
        name
        role
        email
      }
      person {
        id
        firstName
        lastName
        phone
        email
      }
      company {
        id
        name
      }
    }
  }
`;

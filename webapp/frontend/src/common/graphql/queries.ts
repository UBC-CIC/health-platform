/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const query = /* GraphQL */ `
  query Query($input: QueryRequest) {
    query(input: $input) {
      columns
      rows
    }
  }
`;
export const getPatientMinMaxRange = /* GraphQL */ `
  query GetPatientMinMaxRange($patientId: String) {
    getPatientMinMaxRange(patientId: $patientId) {
      columns
      rows
    }
  }
`;
export const searchEvents = /* GraphQL */ `
  query SearchEvents($input: SearchRequest) {
    searchEvents(input: $input) {
      events {
        event_id
        user_id
        start_date_time
        end_date_time
        medication
        mood
        food
        notes
      }
    }
  }
`;
export const getMessage = /* GraphQL */ `
  query GetMessage(
    $patientId: String
    $eventType: String
    $startDate: String
    $endDate: String
  ) {
    getMessage(
      patientId: $patientId
      eventType: $eventType
      startDate: $startDate
      endDate: $endDate
    ) {
      data
    }
  }
`;
export const getEventDetail = /* GraphQL */ `
  query GetEventDetail($eventId: String!) {
    getEventDetail(eventId: $eventId) {
      event_id
      user_id
      start_date_time
      end_date_time
      medication
      mood
      food
      notes
    }
  }
`;
export const listEventDetails = /* GraphQL */ `
  query ListEventDetails(
    $filter: ModelEventDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEventDetails(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        event_id
        user_id
        start_date_time
        end_date_time
        medication
        mood
        food
        notes
      }
      nextToken
    }
  }
`;
export const getEventDetailsByUser = /* GraphQL */ `
  query GetEventDetailsByUser(
    $userId: String!
    $limit: Int
    $nextToken: String
  ) {
    getEventDetailsByUser(
      userId: $userId
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        event_id
        user_id
        start_date_time
        end_date_time
        medication
        mood
        food
        notes
      }
      nextToken
    }
  }
`;
export const getEventDetailsByUserAndCreateTime = /* GraphQL */ `
  query GetEventDetailsByUserAndCreateTime(
    $userId: String!
    $startTime: String!
    $endTime: String!
    $limit: Int
    $nextToken: String
  ) {
    getEventDetailsByUserAndCreateTime(
      userId: $userId
      startTime: $startTime
      endTime: $endTime
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        event_id
        user_id
        start_date_time
        end_date_time
        medication
        mood
        food
        notes
      }
      nextToken
    }
  }
`;
export const getPatientsDetail = /* GraphQL */ `
  query GetPatientsDetail($patientId: String!) {
    getPatientsDetail(patientId: $patientId) {
      patient_id
      name
      sensor_types
      user_ids
    }
  }
`;
export const listPatientsDetails = /* GraphQL */ `
  query ListPatientsDetails(
    $filter: ModelPatientsDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPatientsDetails(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        patient_id
        name
        sensor_types
        user_ids
      }
      nextToken
    }
  }
`;
export const getSensorsDetail = /* GraphQL */ `
  query GetSensorsDetail($patientId: String!) {
    getSensorsDetail(patientId: $patientId) {
      sensor_id
      patient_id
      sensor_types
      watermark
      client_key
      secret_key
    }
  }
`;
export const getSensorsDetailByUser = /* GraphQL */ `
  query GetSensorsDetailByUser(
    $patientId: String!
    $limit: Int
    $nextToken: String
  ) {
    getSensorsDetailByUser(
      patientId: $patientId
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        sensor_id
        patient_id
        sensor_types
        watermark
        client_key
        secret_key
      }
      nextToken
    }
  }
`;
export const listSensorsDetails = /* GraphQL */ `
  query ListSensorsDetails(
    $filter: ModelSensorsDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSensorsDetails(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        sensor_id
        patient_id
        sensor_types
        watermark
        client_key
        secret_key
      }
      nextToken
    }
  }
`;
export const getUsersDetail = /* GraphQL */ `
  query GetUsersDetail($userId: String!) {
    getUsersDetail(userId: $userId) {
      user_id
      email
      user_type
      patient_ids
    }
  }
`;
export const listUsersDetails = /* GraphQL */ `
  query ListUsersDetails(
    $filter: ModelUsersDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsersDetails(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        user_id
        email
        user_type
        patient_ids
      }
      nextToken
    }
  }
`;
export const getPatientEventEarliestDate = /* GraphQL */ `
  query GetPatientEventEarliestDate($userId: String!) {
    getPatientEventEarliestDate(userId: $userId) {
      items {
        event_id
        user_id
        start_date_time
        end_date_time
        medication
        mood
        food
        notes
      }
      nextToken
    }
  }
`;
export const getPatientEventLatestDate = /* GraphQL */ `
  query GetPatientEventLatestDate($userId: String!) {
    getPatientEventLatestDate(userId: $userId) {
      items {
        event_id
        user_id
        start_date_time
        end_date_time
        medication
        mood
        food
        notes
      }
      nextToken
    }
  }
`;

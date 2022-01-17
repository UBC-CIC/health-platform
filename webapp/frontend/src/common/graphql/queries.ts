/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const query = /* GraphQL */ `
  query Query($input: QueryRequest) {
    query(input: $input) {
      timestamp
      heartrate
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

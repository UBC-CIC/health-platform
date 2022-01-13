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
export const getEventDetailsByStatus = /* GraphQL */ `
  query GetEventDetailsByStatus(
    $userId: String!
    $limit: Int
    $nextToken: String
  ) {
    getEventDetailsByStatus(
      userId: $userId
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
export const getEventDetailsByStatusAndCreateTime = /* GraphQL */ `
  query GetEventDetailsByStatusAndCreateTime(
    $userId: String!
    $startTime: String!
    $endTime: String!
    $limit: Int
    $nextToken: String
  ) {
    getEventDetailsByStatusAndCreateTime(
      userId: $userId
      startTime: $startTime
      endTime: $endTime
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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

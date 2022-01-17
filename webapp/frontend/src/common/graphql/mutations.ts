/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createEventDetail = /* GraphQL */ `
  mutation CreateEventDetail(
    $input: EventDetailInput
    $condition: ModelEventDetailConditionInput
  ) {
    createEventDetail(input: $input, condition: $condition) {
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
export const updateEventDetail = /* GraphQL */ `
  mutation UpdateEventDetail(
    $input: EventDetailInput
    $condition: ModelEventDetailConditionInput
  ) {
    updateEventDetail(input: $input, condition: $condition) {
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
export const deleteEventDetail = /* GraphQL */ `
  mutation DeleteEventDetail(
    $input: EventDetailInput
    $condition: ModelEventDetailConditionInput
  ) {
    deleteEventDetail(input: $input, condition: $condition) {
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
export const publishNewEventDetail = /* GraphQL */ `
  mutation PublishNewEventDetail($input: EventDetailInput!) {
    publishNewEventDetail(input: $input) {
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
export const publishEventDetailUpdates = /* GraphQL */ `
  mutation PublishEventDetailUpdates($input: EventDetailInput!) {
    publishEventDetailUpdates(input: $input) {
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

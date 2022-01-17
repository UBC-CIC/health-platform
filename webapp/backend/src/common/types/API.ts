/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type EventDetailInput = {
  event_id: string,
  user_id: string,
  start_date_time?: string | null,
  end_date_time?: string | null,
  medication?: string | null,
  mood?: string | null,
  food?: string | null,
  notes?: string | null,
};

export type ModelEventDetailConditionInput = {
  event_id: string,
  user_id?: ModelStringInput | null,
  start_date_time?: string | null,
  end_date_time?: string | null,
  medication?: string | null,
  mood?: string | null,
  food?: string | null,
  notes?: string | null,
  and?: Array< ModelEventDetailConditionInput | null > | null,
  or?: Array< ModelEventDetailConditionInput | null > | null,
  not?: ModelEventDetailConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type EventDetail = {
  __typename: "EventDetail",
  event_id: string,
  user_id: string,
  start_date_time?: string | null,
  end_date_time?: string | null,
  medication?: string | null,
  mood?: string | null,
  food?: string | null,
  notes?: string | null,
};

export type QueryRequest = {
  start?: string | null,
  end?: string | null,
};

export type QueryResponse = {
  __typename: "QueryResponse",
  timestamp?: Array< number | null > | null,
  heartrate?: Array< number | null > | null,
};

export type ModelEventDetailFilterInput = {
  event_id?: ModelStringInput | null,
  start_date_time?: string | null,
  end_date_time?: string | null,
  medication?: string | null,
  mood?: string | null,
  food?: string | null,
  notes?: string | null,
  and?: Array< ModelEventDetailFilterInput | null > | null,
  or?: Array< ModelEventDetailFilterInput | null > | null,
  not?: ModelEventDetailFilterInput | null,
};

export type EventDetailConnection = {
  __typename: "EventDetailConnection",
  items?:  Array<EventDetail | null > | null,
  nextToken?: string | null,
};

export type CreateEventDetailMutationVariables = {
  input?: EventDetailInput | null,
  condition?: ModelEventDetailConditionInput | null,
};

export type CreateEventDetailMutation = {
  createEventDetail?:  {
    __typename: "EventDetail",
    event_id: string,
    user_id: string,
    start_date_time?: string | null,
    end_date_time?: string | null,
    medication?: string | null,
    mood?: string | null,
    food?: string | null,
    notes?: string | null,
  } | null,
};

export type UpdateEventDetailMutationVariables = {
  input?: EventDetailInput | null,
  condition?: ModelEventDetailConditionInput | null,
};

export type UpdateEventDetailMutation = {
  updateEventDetail?:  {
    __typename: "EventDetail",
    event_id: string,
    user_id: string,
    start_date_time?: string | null,
    end_date_time?: string | null,
    medication?: string | null,
    mood?: string | null,
    food?: string | null,
    notes?: string | null,
  } | null,
};

export type DeleteEventDetailMutationVariables = {
  input?: EventDetailInput | null,
  condition?: ModelEventDetailConditionInput | null,
};

export type DeleteEventDetailMutation = {
  deleteEventDetail?:  {
    __typename: "EventDetail",
    event_id: string,
    user_id: string,
    start_date_time?: string | null,
    end_date_time?: string | null,
    medication?: string | null,
    mood?: string | null,
    food?: string | null,
    notes?: string | null,
  } | null,
};

export type PublishNewEventDetailMutationVariables = {
  input: EventDetailInput,
};

export type PublishNewEventDetailMutation = {
  publishNewEventDetail?:  {
    __typename: "EventDetail",
    event_id: string,
    user_id: string,
    start_date_time?: string | null,
    end_date_time?: string | null,
    medication?: string | null,
    mood?: string | null,
    food?: string | null,
    notes?: string | null,
  } | null,
};

export type PublishEventDetailUpdatesMutationVariables = {
  input: EventDetailInput,
};

export type PublishEventDetailUpdatesMutation = {
  publishEventDetailUpdates?:  {
    __typename: "EventDetail",
    event_id: string,
    user_id: string,
    start_date_time?: string | null,
    end_date_time?: string | null,
    medication?: string | null,
    mood?: string | null,
    food?: string | null,
    notes?: string | null,
  } | null,
};

export type QueryQueryVariables = {
  input?: QueryRequest | null,
};

export type QueryQuery = {
  query?:  {
    __typename: "QueryResponse",
    timestamp?: Array< number | null > | null,
    heartrate?: Array< number | null > | null,
  } | null,
};

export type GetEventDetailQueryVariables = {
  eventId: string,
};

export type GetEventDetailQuery = {
  getEventDetail?:  {
    __typename: "EventDetail",
    event_id: string,
    user_id: string,
    start_date_time?: string | null,
    end_date_time?: string | null,
    medication?: string | null,
    mood?: string | null,
    food?: string | null,
    notes?: string | null,
  } | null,
};

export type ListEventDetailsQueryVariables = {
  filter?: ModelEventDetailFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListEventDetailsQuery = {
  listEventDetails?:  {
    __typename: "EventDetailConnection",
    items?:  Array< {
      __typename: "EventDetail",
      event_id: string,
      user_id: string,
      start_date_time?: string | null,
      end_date_time?: string | null,
      medication?: string | null,
      mood?: string | null,
      food?: string | null,
      notes?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetEventDetailsByUserQueryVariables = {
  userId: string,
  limit?: number | null,
  nextToken?: string | null,
};

export type GetEventDetailsByUserQuery = {
  getEventDetailsByUser?:  {
    __typename: "EventDetailConnection",
    items?:  Array< {
      __typename: "EventDetail",
      event_id: string,
      user_id: string,
      start_date_time?: string | null,
      end_date_time?: string | null,
      medication?: string | null,
      mood?: string | null,
      food?: string | null,
      notes?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetEventDetailsByUserAndCreateTimeQueryVariables = {
  userId: string,
  startTime: string,
  endTime: string,
  limit?: number | null,
  nextToken?: string | null,
};

export type GetEventDetailsByUserAndCreateTimeQuery = {
  getEventDetailsByUserAndCreateTime?:  {
    __typename: "EventDetailConnection",
    items?:  Array< {
      __typename: "EventDetail",
      event_id: string,
      user_id: string,
      start_date_time?: string | null,
      end_date_time?: string | null,
      medication?: string | null,
      mood?: string | null,
      food?: string | null,
      notes?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type OnCreateEventDetailSubscription = {
  onCreateEventDetail?:  {
    __typename: "EventDetail",
    event_id: string,
    user_id: string,
    start_date_time?: string | null,
    end_date_time?: string | null,
    medication?: string | null,
    mood?: string | null,
    food?: string | null,
    notes?: string | null,
  } | null,
};

export type OnUpdateEventDetailSubscription = {
  onUpdateEventDetail?:  {
    __typename: "EventDetail",
    event_id: string,
    user_id: string,
    start_date_time?: string | null,
    end_date_time?: string | null,
    medication?: string | null,
    mood?: string | null,
    food?: string | null,
    notes?: string | null,
  } | null,
};

export type OnDeleteEventDetailSubscription = {
  onDeleteEventDetail?:  {
    __typename: "EventDetail",
    event_id: string,
    user_id: string,
    start_date_time?: string | null,
    end_date_time?: string | null,
    medication?: string | null,
    mood?: string | null,
    food?: string | null,
    notes?: string | null,
  } | null,
};

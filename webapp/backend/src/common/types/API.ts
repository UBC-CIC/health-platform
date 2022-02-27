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
  event_id?: string,
  user_id?: string,
  start_date_time?: string | null,
  end_date_time?: string | null,
  medication?: string | null,
  mood?: string | null,
  food?: string | null,
  notes?: string | null,
};

export type PatientsDetailInput = {
  patient_id: string,
  name?: string | null,
  sensor_types?: Array< string | null > | null,
};

export type ModelPatientsDetailConditionInput = {
  patient_id: string,
  name?: string | null,
  sensor_types?: Array< string | null > | null,
  and?: Array< ModelPatientsDetailConditionInput | null > | null,
  or?: Array< ModelPatientsDetailConditionInput | null > | null,
  not?: ModelPatientsDetailConditionInput | null,
};

export type PatientsDetail = {
  __typename: "PatientsDetail",
  patient_id?: string,
  name?: string | null,
  sensor_types?: Array< string | null > | null,
};

export type SensorsDetailInput = {
  sensor_id: string,
  patient_id?: string | null,
  sensor_types?: Array< string | null > | null,
};

export type ModelSensorsDetailConditionInput = {
  sensor_id: string,
  patient_id?: string | null,
  sensor_types?: Array< string | null > | null,
  and?: Array< ModelSensorsDetailConditionInput | null > | null,
  or?: Array< ModelSensorsDetailConditionInput | null > | null,
  not?: ModelSensorsDetailConditionInput | null,
};

export type SensorsDetail = {
  __typename: "SensorsDetail",
  sensor_id?: string,
  patient_id?: string | null,
  sensor_types?: Array< string | null > | null,
};

export type UsersDetailInput = {
  user_id: string,
  email?: string | null,
  user_type?: string | null,
  patient_ids?: Array< string | null > | null,
};

export type ModelUsersDetailConditionInput = {
  user_id: string,
  email?: string | null,
  user_type?: string | null,
  patient_ids?: Array< string | null > | null,
  and?: Array< ModelUsersDetailConditionInput | null > | null,
  or?: Array< ModelUsersDetailConditionInput | null > | null,
  not?: ModelUsersDetailConditionInput | null,
};

export type UsersDetail = {
  __typename: "UsersDetail",
  user_id?: string,
  email?: string | null,
  user_type?: string | null,
  patient_ids?: Array< string | null > | null,
};

export type QueryRequest = {
  patient_id?: string | null,
  period?: string | null,
  statistic?: string | null,
  start?: string | null,
  end?: string | null,
};

export type QueryResponse = {
  __typename: "QueryResponse",
  columns?: Array< string | null > | null,
  rows?: Array< Array< string | null > | null > | null,
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

export type ModelPatientsDetailFilterInput = {
  patient_id: string,
  name?: string | null,
  sensor_types?: Array< string | null > | null,
  and?: Array< ModelPatientsDetailFilterInput | null > | null,
  or?: Array< ModelPatientsDetailFilterInput | null > | null,
  not?: ModelPatientsDetailFilterInput | null,
};

export type PatientsDetailConnection = {
  __typename: "PatientsDetailConnection",
  items?:  Array<PatientsDetail | null > | null,
  nextToken?: string | null,
};

export type ModelSensorsDetailFilterInput = {
  sensor_id: string,
  patient_id?: string | null,
  sensor_types?: Array< string | null > | null,
  and?: Array< ModelSensorsDetailFilterInput | null > | null,
  or?: Array< ModelSensorsDetailFilterInput | null > | null,
  not?: ModelSensorsDetailFilterInput | null,
};

export type SensorsDetailConnection = {
  __typename: "SensorsDetailConnection",
  items?:  Array<SensorsDetail | null > | null,
  nextToken?: string | null,
};

export type ModelUsersDetailFilterInput = {
  user_id: string,
  email?: string | null,
  user_type?: string | null,
  patient_ids?: Array< string | null > | null,
  and?: Array< ModelUsersDetailFilterInput | null > | null,
  or?: Array< ModelUsersDetailFilterInput | null > | null,
  not?: ModelUsersDetailFilterInput | null,
};

export type UsersDetailConnection = {
  __typename: "UsersDetailConnection",
  items?:  Array<UsersDetail | null > | null,
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
  input?: EventDetailInput,
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
  input?: EventDetailInput,
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

export type CreatePatientsDetailMutationVariables = {
  input?: PatientsDetailInput | null,
  condition?: ModelPatientsDetailConditionInput | null,
};

export type CreatePatientsDetailMutation = {
  createPatientsDetail?:  {
    __typename: "PatientsDetail",
    patient_id: string,
    name?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type UpdatePatientsDetailMutationVariables = {
  input?: PatientsDetailInput | null,
  condition?: ModelPatientsDetailConditionInput | null,
};

export type UpdatePatientsDetailMutation = {
  updatePatientsDetail?:  {
    __typename: "PatientsDetail",
    patient_id: string,
    name?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type DeletePatientsDetailMutationVariables = {
  input?: PatientsDetailInput | null,
  condition?: ModelPatientsDetailConditionInput | null,
};

export type DeletePatientsDetailMutation = {
  deletePatientsDetail?:  {
    __typename: "PatientsDetail",
    patient_id: string,
    name?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type PublishNewPatientsDetailMutationVariables = {
  input?: PatientsDetailInput,
};

export type PublishNewPatientsDetailMutation = {
  publishNewPatientsDetail?:  {
    __typename: "PatientsDetail",
    patient_id: string,
    name?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type PublishPatientsDetailUpdatesMutationVariables = {
  input?: PatientsDetailInput,
};

export type PublishPatientsDetailUpdatesMutation = {
  publishPatientsDetailUpdates?:  {
    __typename: "PatientsDetail",
    patient_id: string,
    name?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type CreateSensorsDetailMutationVariables = {
  input?: SensorsDetailInput | null,
  condition?: ModelSensorsDetailConditionInput | null,
};

export type CreateSensorsDetailMutation = {
  createSensorsDetail?:  {
    __typename: "SensorsDetail",
    sensor_id: string,
    patient_id?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type UpdateSensorsDetailMutationVariables = {
  input?: SensorsDetailInput | null,
  condition?: ModelSensorsDetailConditionInput | null,
};

export type UpdateSensorsDetailMutation = {
  updateSensorsDetail?:  {
    __typename: "SensorsDetail",
    sensor_id: string,
    patient_id?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type DeleteSensorsDetailMutationVariables = {
  input?: SensorsDetailInput | null,
  condition?: ModelSensorsDetailConditionInput | null,
};

export type DeleteSensorsDetailMutation = {
  deleteSensorsDetail?:  {
    __typename: "SensorsDetail",
    sensor_id: string,
    patient_id?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type PublishNewSensorsDetailMutationVariables = {
  input?: SensorsDetailInput,
};

export type PublishNewSensorsDetailMutation = {
  publishNewSensorsDetail?:  {
    __typename: "SensorsDetail",
    sensor_id: string,
    patient_id?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type PublishSensorsDetailUpdatesMutationVariables = {
  input?: SensorsDetailInput,
};

export type PublishSensorsDetailUpdatesMutation = {
  publishSensorsDetailUpdates?:  {
    __typename: "SensorsDetail",
    sensor_id: string,
    patient_id?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type CreateUsersDetailMutationVariables = {
  input?: UsersDetailInput | null,
  condition?: ModelUsersDetailConditionInput | null,
};

export type CreateUsersDetailMutation = {
  createUsersDetail?:  {
    __typename: "UsersDetail",
    user_id: string,
    email?: string | null,
    user_type?: string | null,
    patient_ids?: Array< string | null > | null,
  } | null,
};

export type UpdateUsersDetailMutationVariables = {
  input?: UsersDetailInput | null,
  condition?: ModelUsersDetailConditionInput | null,
};

export type UpdateUsersDetailMutation = {
  updateUsersDetail?:  {
    __typename: "UsersDetail",
    user_id: string,
    email?: string | null,
    user_type?: string | null,
    patient_ids?: Array< string | null > | null,
  } | null,
};

export type DeleteUsersDetailMutationVariables = {
  input?: UsersDetailInput | null,
  condition?: ModelUsersDetailConditionInput | null,
};

export type DeleteUsersDetailMutation = {
  deleteUsersDetail?:  {
    __typename: "UsersDetail",
    user_id: string,
    email?: string | null,
    user_type?: string | null,
    patient_ids?: Array< string | null > | null,
  } | null,
};

export type PublishNewUsersDetailMutationVariables = {
  input?: UsersDetailInput,
};

export type PublishNewUsersDetailMutation = {
  publishNewUsersDetail?:  {
    __typename: "UsersDetail",
    user_id: string,
    email?: string | null,
    user_type?: string | null,
    patient_ids?: Array< string | null > | null,
  } | null,
};

export type PublishUsersDetailUpdatesMutationVariables = {
  input?: UsersDetailInput,
};

export type PublishUsersDetailUpdatesMutation = {
  publishUsersDetailUpdates?:  {
    __typename: "UsersDetail",
    user_id: string,
    email?: string | null,
    user_type?: string | null,
    patient_ids?: Array< string | null > | null,
  } | null,
};

export type QueryQueryVariables = {
  input?: QueryRequest | null,
};

export type QueryQuery = {
  query?:  {
    __typename: "QueryResponse",
    columns?: Array< string | null > | null,
    rows?: Array< Array< string | null > | null > | null,
  } | null,
};

export type GetEventDetailQueryVariables = {
  eventId?: string,
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
  userId?: string,
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
  userId?: string,
  startTime?: string,
  endTime?: string,
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

export type GetPatientsDetailQueryVariables = {
  patientId?: string,
};

export type GetPatientsDetailQuery = {
  getPatientsDetail?:  {
    __typename: "PatientsDetail",
    patient_id: string,
    name?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type ListPatientsDetailsQueryVariables = {
  filter?: ModelPatientsDetailFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPatientsDetailsQuery = {
  listPatientsDetails?:  {
    __typename: "PatientsDetailConnection",
    items?:  Array< {
      __typename: "PatientsDetail",
      patient_id: string,
      name?: string | null,
      sensor_types?: Array< string | null > | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetSensorsDetailQueryVariables = {
  patientId?: string,
};

export type GetSensorsDetailQuery = {
  getSensorsDetail?:  {
    __typename: "SensorsDetail",
    sensor_id: string,
    patient_id?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type ListSensorsDetailsQueryVariables = {
  filter?: ModelSensorsDetailFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSensorsDetailsQuery = {
  listSensorsDetails?:  {
    __typename: "SensorsDetailConnection",
    items?:  Array< {
      __typename: "SensorsDetail",
      sensor_id: string,
      patient_id?: string | null,
      sensor_types?: Array< string | null > | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetUsersDetailQueryVariables = {
  userId?: string,
};

export type GetUsersDetailQuery = {
  getUsersDetail?:  {
    __typename: "UsersDetail",
    user_id: string,
    email?: string | null,
    user_type?: string | null,
    patient_ids?: Array< string | null > | null,
  } | null,
};

export type ListUsersDetailsQueryVariables = {
  filter?: ModelUsersDetailFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUsersDetailsQuery = {
  listUsersDetails?:  {
    __typename: "UsersDetailConnection",
    items?:  Array< {
      __typename: "UsersDetail",
      user_id: string,
      email?: string | null,
      user_type?: string | null,
      patient_ids?: Array< string | null > | null,
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

export type OnCreatePatientsDetailSubscription = {
  onCreatePatientsDetail?:  {
    __typename: "PatientsDetail",
    patient_id: string,
    name?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type OnUpdatePatientsDetailSubscription = {
  onUpdatePatientsDetail?:  {
    __typename: "PatientsDetail",
    patient_id: string,
    name?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type OnDeletePatientsDetailSubscription = {
  onDeletePatientsDetail?:  {
    __typename: "PatientsDetail",
    patient_id: string,
    name?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type OnCreateSensorsDetailSubscription = {
  onCreateSensorsDetail?:  {
    __typename: "SensorsDetail",
    sensor_id: string,
    patient_id?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type OnUpdateSensorsDetailSubscription = {
  onUpdateSensorsDetail?:  {
    __typename: "SensorsDetail",
    sensor_id: string,
    patient_id?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type OnDeleteSensorsDetailSubscription = {
  onDeleteSensorsDetail?:  {
    __typename: "SensorsDetail",
    sensor_id: string,
    patient_id?: string | null,
    sensor_types?: Array< string | null > | null,
  } | null,
};

export type OnCreateUsersDetailSubscription = {
  onCreateUsersDetail?:  {
    __typename: "UsersDetail",
    user_id: string,
    email?: string | null,
    user_type?: string | null,
    patient_ids?: Array< string | null > | null,
  } | null,
};

export type OnUpdateUsersDetailSubscription = {
  onUpdateUsersDetail?:  {
    __typename: "UsersDetail",
    user_id: string,
    email?: string | null,
    user_type?: string | null,
    patient_ids?: Array< string | null > | null,
  } | null,
};

export type OnDeleteUsersDetailSubscription = {
  onDeleteUsersDetail?:  {
    __typename: "UsersDetail",
    user_id: string,
    email?: string | null,
    user_type?: string | null,
    patient_ids?: Array< string | null > | null,
  } | null,
};

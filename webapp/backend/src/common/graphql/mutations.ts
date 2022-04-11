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
export const createPatientsDetail = /* GraphQL */ `
  mutation CreatePatientsDetail(
    $input: PatientsDetailInput
    $condition: ModelPatientsDetailConditionInput
  ) {
    createPatientsDetail(input: $input, condition: $condition) {
      patient_id
      name
      sensor_types
      user_ids
    }
  }
`;
export const updatePatientsDetail = /* GraphQL */ `
  mutation UpdatePatientsDetail(
    $input: PatientsDetailInput
    $condition: ModelPatientsDetailConditionInput
  ) {
    updatePatientsDetail(input: $input, condition: $condition) {
      patient_id
      name
      sensor_types
      user_ids
    }
  }
`;
export const deletePatientsDetail = /* GraphQL */ `
  mutation DeletePatientsDetail(
    $input: PatientsDetailInput
    $condition: ModelPatientsDetailConditionInput
  ) {
    deletePatientsDetail(input: $input, condition: $condition) {
      patient_id
      name
      sensor_types
      user_ids
    }
  }
`;
export const publishNewPatientsDetail = /* GraphQL */ `
  mutation PublishNewPatientsDetail($input: PatientsDetailInput!) {
    publishNewPatientsDetail(input: $input) {
      patient_id
      name
      sensor_types
      user_ids
    }
  }
`;
export const publishPatientsDetailUpdates = /* GraphQL */ `
  mutation PublishPatientsDetailUpdates($input: PatientsDetailInput!) {
    publishPatientsDetailUpdates(input: $input) {
      patient_id
      name
      sensor_types
      user_ids
    }
  }
`;
export const createSensorsDetail = /* GraphQL */ `
  mutation CreateSensorsDetail(
    $input: SensorsDetailInput
    $condition: ModelSensorsDetailConditionInput
  ) {
    createSensorsDetail(input: $input, condition: $condition) {
      sensor_id
      patient_id
      sensor_types
    }
  }
`;
export const updateSensorsDetail = /* GraphQL */ `
  mutation UpdateSensorsDetail(
    $input: SensorsDetailInput
    $condition: ModelSensorsDetailConditionInput
  ) {
    updateSensorsDetail(input: $input, condition: $condition) {
      sensor_id
      patient_id
      sensor_types
    }
  }
`;
export const deleteSensorsDetail = /* GraphQL */ `
  mutation DeleteSensorsDetail(
    $input: SensorsDetailInput
    $condition: ModelSensorsDetailConditionInput
  ) {
    deleteSensorsDetail(input: $input, condition: $condition) {
      sensor_id
      patient_id
      sensor_types
    }
  }
`;
export const publishNewSensorsDetail = /* GraphQL */ `
  mutation PublishNewSensorsDetail($input: SensorsDetailInput!) {
    publishNewSensorsDetail(input: $input) {
      sensor_id
      patient_id
      sensor_types
    }
  }
`;
export const publishSensorsDetailUpdates = /* GraphQL */ `
  mutation PublishSensorsDetailUpdates($input: SensorsDetailInput!) {
    publishSensorsDetailUpdates(input: $input) {
      sensor_id
      patient_id
      sensor_types
    }
  }
`;
export const createUsersDetail = /* GraphQL */ `
  mutation CreateUsersDetail(
    $input: UsersDetailInput
    $condition: ModelUsersDetailConditionInput
  ) {
    createUsersDetail(input: $input, condition: $condition) {
      user_id
      email
      user_type
      patient_ids
    }
  }
`;
export const updateUsersDetail = /* GraphQL */ `
  mutation UpdateUsersDetail(
    $input: UsersDetailInput
    $condition: ModelUsersDetailConditionInput
  ) {
    updateUsersDetail(input: $input, condition: $condition) {
      user_id
      email
      user_type
      patient_ids
    }
  }
`;
export const deleteUsersDetail = /* GraphQL */ `
  mutation DeleteUsersDetail(
    $input: UsersDetailInput
    $condition: ModelUsersDetailConditionInput
  ) {
    deleteUsersDetail(input: $input, condition: $condition) {
      user_id
      email
      user_type
      patient_ids
    }
  }
`;
export const publishNewUsersDetail = /* GraphQL */ `
  mutation PublishNewUsersDetail($input: UsersDetailInput!) {
    publishNewUsersDetail(input: $input) {
      user_id
      email
      user_type
      patient_ids
    }
  }
`;
export const publishUsersDetailUpdates = /* GraphQL */ `
  mutation PublishUsersDetailUpdates($input: UsersDetailInput!) {
    publishUsersDetailUpdates(input: $input) {
      user_id
      email
      user_type
      patient_ids
    }
  }
`;
export const simulate = /* GraphQL */ `
  mutation Simulate($input: SimulateRequest) {
    simulate(input: $input) {
      status
    }
  }
`;

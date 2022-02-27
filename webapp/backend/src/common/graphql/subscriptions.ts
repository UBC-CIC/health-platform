/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateEventDetail = /* GraphQL */ `
  subscription OnCreateEventDetail {
    onCreateEventDetail {
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
export const onUpdateEventDetail = /* GraphQL */ `
  subscription OnUpdateEventDetail {
    onUpdateEventDetail {
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
export const onDeleteEventDetail = /* GraphQL */ `
  subscription OnDeleteEventDetail {
    onDeleteEventDetail {
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
export const onCreatePatientsDetail = /* GraphQL */ `
  subscription OnCreatePatientsDetail {
    onCreatePatientsDetail {
      patient_id
      name
      sensor_types
    }
  }
`;
export const onUpdatePatientsDetail = /* GraphQL */ `
  subscription OnUpdatePatientsDetail {
    onUpdatePatientsDetail {
      patient_id
      name
      sensor_types
    }
  }
`;
export const onDeletePatientsDetail = /* GraphQL */ `
  subscription OnDeletePatientsDetail {
    onDeletePatientsDetail {
      patient_id
      name
      sensor_types
    }
  }
`;
export const onCreateSensorsDetail = /* GraphQL */ `
  subscription OnCreateSensorsDetail {
    onCreateSensorsDetail {
      sensor_id
      patient_id
      sensor_types
    }
  }
`;
export const onUpdateSensorsDetail = /* GraphQL */ `
  subscription OnUpdateSensorsDetail {
    onUpdateSensorsDetail {
      sensor_id
      patient_id
      sensor_types
    }
  }
`;
export const onDeleteSensorsDetail = /* GraphQL */ `
  subscription OnDeleteSensorsDetail {
    onDeleteSensorsDetail {
      sensor_id
      patient_id
      sensor_types
    }
  }
`;
export const onCreateUsersDetail = /* GraphQL */ `
  subscription OnCreateUsersDetail {
    onCreateUsersDetail {
      user_id
      email
      user_type
      patient_ids
    }
  }
`;
export const onUpdateUsersDetail = /* GraphQL */ `
  subscription OnUpdateUsersDetail {
    onUpdateUsersDetail {
      user_id
      email
      user_type
      patient_ids
    }
  }
`;
export const onDeleteUsersDetail = /* GraphQL */ `
  subscription OnDeleteUsersDetail {
    onDeleteUsersDetail {
      user_id
      email
      user_type
      patient_ids
    }
  }
`;

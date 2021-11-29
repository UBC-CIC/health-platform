/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSpecialistProfile = /* GraphQL */ `
  query GetSpecialistProfile($phoneNumber: String!) {
    getSpecialistProfile(phoneNumber: $phoneNumber) {
      email
      first_name
      last_name
      phone_number
      user_role
      organization
      profile_picture
      notes
      user_status
      call_status
      availability {
        overrides {
          start_time
          end_time
          override_type
        }
        schedules {
          start_time
          end_time
          override_type
        }
      }
      created_date_time
      updated_date_time
      location {
        latitude
        longitude
      }
    }
  }
`;
export const listSpecialistProfilesByStatus = /* GraphQL */ `
  query ListSpecialistProfilesByStatus(
    $userStatus: SpecialistStatus
    $limit: Int
    $nextToken: String
  ) {
    listSpecialistProfilesByStatus(
      userStatus: $userStatus
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        email
        first_name
        last_name
        phone_number
        user_role
        organization
        profile_picture
        notes
        user_status
        call_status
        availability {
          overrides {
            start_time
            end_time
            override_type
          }
          schedules {
            start_time
            end_time
            override_type
          }
        }
        created_date_time
        updated_date_time
        location {
          latitude
          longitude
        }
      }
      nextToken
    }
  }
`;
export const getSpecialistProfilesByStatus = /* GraphQL */ `
  query GetSpecialistProfilesByStatus($userStatus: SpecialistStatus) {
    getSpecialistProfilesByStatus(userStatus: $userStatus) {
      items {
        email
        first_name
        last_name
        phone_number
        user_role
        organization
        profile_picture
        notes
        user_status
        call_status
        availability {
          overrides {
            start_time
            end_time
            override_type
          }
          schedules {
            start_time
            end_time
            override_type
          }
        }
        created_date_time
        updated_date_time
        location {
          latitude
          longitude
        }
      }
      nextToken
    }
  }
`;
export const listSpecialistProfiles = /* GraphQL */ `
  query ListSpecialistProfiles($limit: Int, $nextToken: String) {
    listSpecialistProfiles(limit: $limit, nextToken: $nextToken) {
      items {
        email
        first_name
        last_name
        phone_number
        user_role
        organization
        profile_picture
        notes
        user_status
        call_status
        availability {
          overrides {
            start_time
            end_time
            override_type
          }
          schedules {
            start_time
            end_time
            override_type
          }
        }
        created_date_time
        updated_date_time
        location {
          latitude
          longitude
        }
      }
      nextToken
    }
  }
`;
export const getMeetingDetail = /* GraphQL */ `
  query GetMeetingDetail($meetingId: String!) {
    getMeetingDetail(meetingId: $meetingId) {
      meeting_id
      attendees {
        phone_number
        attendee_id
        attendee_type
        attendee_join_type
        attendee_state
        user_role
        organization
        first_name
        last_name
        username
        location {
          latitude
          longitude
        }
      }
      create_date_time
      end_date_time
      call_id
      external_meeting_id
      meeting_status
      meeting_title
      meeting_comments
      location {
        latitude
        longitude
      }
    }
  }
`;
export const listMeetingDetails = /* GraphQL */ `
  query ListMeetingDetails(
    $filter: ModelMeetingDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMeetingDetails(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        meeting_id
        attendees {
          phone_number
          attendee_id
          attendee_type
          attendee_join_type
          attendee_state
          user_role
          organization
          first_name
          last_name
          username
          location {
            latitude
            longitude
          }
        }
        create_date_time
        end_date_time
        call_id
        external_meeting_id
        meeting_status
        meeting_title
        meeting_comments
        location {
          latitude
          longitude
        }
      }
      nextToken
    }
  }
`;
export const getMeetingDetailsByStatus = /* GraphQL */ `
  query GetMeetingDetailsByStatus(
    $meetingStatus: String!
    $limit: Int
    $nextToken: String
  ) {
    getMeetingDetailsByStatus(
      meetingStatus: $meetingStatus
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        meeting_id
        attendees {
          phone_number
          attendee_id
          attendee_type
          attendee_join_type
          attendee_state
          user_role
          organization
          first_name
          last_name
          username
          location {
            latitude
            longitude
          }
        }
        create_date_time
        end_date_time
        call_id
        external_meeting_id
        meeting_status
        meeting_title
        meeting_comments
        location {
          latitude
          longitude
        }
      }
      nextToken
    }
  }
`;
export const getMeetingDetailsByStatusAndCreateTime = /* GraphQL */ `
  query GetMeetingDetailsByStatusAndCreateTime(
    $meetingStatus: String!
    $startTime: String!
    $endTime: String!
    $limit: Int
    $nextToken: String
  ) {
    getMeetingDetailsByStatusAndCreateTime(
      meetingStatus: $meetingStatus
      startTime: $startTime
      endTime: $endTime
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        meeting_id
        attendees {
          phone_number
          attendee_id
          attendee_type
          attendee_join_type
          attendee_state
          user_role
          organization
          first_name
          last_name
          username
          location {
            latitude
            longitude
          }
        }
        create_date_time
        end_date_time
        call_id
        external_meeting_id
        meeting_status
        meeting_title
        meeting_comments
        location {
          latitude
          longitude
        }
      }
      nextToken
    }
  }
`;
export const getServiceDeskProfile = /* GraphQL */ `
  query GetServiceDeskProfile($username: String!) {
    getServiceDeskProfile(username: $username) {
      name
      phone_number
      email
      username
    }
  }
`;

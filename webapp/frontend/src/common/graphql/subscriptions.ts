/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateMeetingDetail = /* GraphQL */ `
  subscription OnCreateMeetingDetail {
    onCreateMeetingDetail {
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
export const onUpdateMeetingDetail = /* GraphQL */ `
  subscription OnUpdateMeetingDetail {
    onUpdateMeetingDetail {
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
export const onDeleteMeetingDetail = /* GraphQL */ `
  subscription OnDeleteMeetingDetail {
    onDeleteMeetingDetail {
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

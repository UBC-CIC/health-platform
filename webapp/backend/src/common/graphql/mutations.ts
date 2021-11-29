/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMeetingDetail = /* GraphQL */ `
  mutation CreateMeetingDetail(
    $input: MeetingDetailInput
    $condition: ModelMeetingDetailConditionInput
  ) {
    createMeetingDetail(input: $input, condition: $condition) {
      meeting_id
      create_date_time
      end_date_time
      call_id
      external_meeting_id
      meeting_status
      meeting_title
      meeting_comments
    }
  }
`;
export const updateMeetingDetail = /* GraphQL */ `
  mutation UpdateMeetingDetail(
    $input: MeetingDetailInput
    $condition: ModelMeetingDetailConditionInput
  ) {
    updateMeetingDetail(input: $input, condition: $condition) {
      meeting_id
      create_date_time
      end_date_time
      call_id
      external_meeting_id
      meeting_status
      meeting_title
      meeting_comments
    }
  }
`;
export const deleteMeetingDetail = /* GraphQL */ `
  mutation DeleteMeetingDetail(
    $input: MeetingDetailInput
    $condition: ModelMeetingDetailConditionInput
  ) {
    deleteMeetingDetail(input: $input, condition: $condition) {
      meeting_id
      create_date_time
      end_date_time
      call_id
      external_meeting_id
      meeting_status
      meeting_title
      meeting_comments
    }
  }
`;
export const publishNewMeetingDetail = /* GraphQL */ `
  mutation PublishNewMeetingDetail($input: MeetingDetailInput!) {
    publishNewMeetingDetail(input: $input) {
      meeting_id
      create_date_time
      end_date_time
      call_id
      external_meeting_id
      meeting_status
      meeting_title
      meeting_comments
    }
  }
`;
export const publishMeetingDetailUpdates = /* GraphQL */ `
  mutation PublishMeetingDetailUpdates($input: MeetingDetailInput!) {
    publishMeetingDetailUpdates(input: $input) {
      meeting_id
      create_date_time
      end_date_time
      call_id
      external_meeting_id
      meeting_status
      meeting_title
      meeting_comments
    }
  }
`;
export const endMeeting = /* GraphQL */ `
  mutation EndMeeting($input: EndMeetingInput) {
    endMeeting(input: $input)
  }
`;

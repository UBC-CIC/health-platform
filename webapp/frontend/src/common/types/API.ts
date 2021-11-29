/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type SpecialistProfileInput = {
  email?: string | null,
  first_name?: string | null,
  last_name?: string | null,
  phone_number: string,
  user_role?: string | null,
  organization?: string | null,
  profile_picture?: string | null,
  notes?: string | null,
  user_status?: SpecialistStatus | null,
  call_status?: SpecialistCallStatus | null,
  location?: GeolocationCoordinatesInput | null,
  availability?: SpecialistAvailabilityInput | null,
  created_date_time?: string | null,
  updated_date_time?: string | null,
};

export enum SpecialistStatus {
  AVAILABLE = "AVAILABLE",
  NOT_AVAILABLE = "NOT_AVAILABLE",
  OFFLINE = "OFFLINE",
}


export enum SpecialistCallStatus {
  PAGED = "PAGED",
  IN_CALL = "IN_CALL",
  NOT_IN_CALL = "NOT_IN_CALL",
}


export type GeolocationCoordinatesInput = {
  latitude?: number | null,
  longitude?: number | null,
};

export type SpecialistAvailabilityInput = {
  overrides?: Array< SpecialistAvalabilityOverrideInput | null > | null,
  schedules?: Array< SpecialistAvalabilityOverrideInput | null > | null,
};

export type SpecialistAvalabilityOverrideInput = {
  start_time?: string | null,
  end_time?: string | null,
  override_type?: SpecialistStatus | null,
};

export type SpecialistProfile = {
  __typename: "SpecialistProfile",
  email?: string | null,
  first_name?: string | null,
  last_name?: string | null,
  phone_number?: string,
  user_role?: string | null,
  organization?: string | null,
  profile_picture?: string | null,
  notes?: string | null,
  user_status?: SpecialistStatus | null,
  call_status?: SpecialistCallStatus | null,
  availability?: SpecialistAvailability,
  created_date_time?: string | null,
  updated_date_time?: string | null,
  location?: GeolocationCoordinates,
};

export type SpecialistAvailability = {
  __typename: "SpecialistAvailability",
  overrides?:  Array<SpecialistAvalabilityOverride | null > | null,
  schedules?:  Array<SpecialistAvalabilityOverride | null > | null,
};

export type SpecialistAvalabilityOverride = {
  __typename: "SpecialistAvalabilityOverride",
  start_time?: string | null,
  end_time?: string | null,
  override_type?: SpecialistStatus | null,
};

export type GeolocationCoordinates = {
  __typename: "GeolocationCoordinates",
  latitude?: number | null,
  longitude?: number | null,
};

export type MeetingDetailInput = {
  meeting_id: string,
  attendees?: Array< AttendeeInput | null > | null,
  create_date_time?: string | null,
  end_date_time?: string | null,
  call_id?: string | null,
  external_meeting_id?: string | null,
  meeting_status?: string | null,
  meeting_title?: string | null,
  meeting_comments?: string | null,
  location?: GeolocationCoordinatesInput | null,
};

export type AttendeeInput = {
  phone_number?: string | null,
  attendee_id?: string | null,
  attendee_type?: AttendeeType | null,
  attendee_join_type?: AttendeeJoinType | null,
  attendee_state?: AttendeeState | null,
  user_role?: string | null,
  organization?: string | null,
  first_name?: string | null,
  last_name?: string | null,
  username?: string | null,
  location?: GeolocationCoordinatesInput | null,
};

export enum AttendeeType {
  FIRST_RESPONDER = "FIRST_RESPONDER",
  SPECIALIST = "SPECIALIST",
  SERVICE_DESK = "SERVICE_DESK",
  NOT_SPECIFIED = "NOT_SPECIFIED",
}


export enum AttendeeJoinType {
  PSTN = "PSTN",
  DATA = "DATA",
}


export enum AttendeeState {
  PAGED = "PAGED",
  IN_CALL = "IN_CALL",
  LEFT = "LEFT",
  KICKED = "KICKED",
}


export type ModelMeetingDetailConditionInput = {
  attendees?: ModelStringInput | null,
  create_date_time?: ModelStringInput | null,
  end_date_time?: string | null,
  call_id?: ModelStringInput | null,
  external_meeting_id?: ModelStringInput | null,
  meeting_status?: ModelStringInput | null,
  meeting_title?: ModelStringInput | null,
  meeting_comments?: ModelStringInput | null,
  and?: Array< ModelMeetingDetailConditionInput | null > | null,
  or?: Array< ModelMeetingDetailConditionInput | null > | null,
  not?: ModelMeetingDetailConditionInput | null,
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

export type MeetingDetail = {
  __typename: "MeetingDetail",
  meeting_id?: string,
  attendees?:  Array<Attendee | null > | null,
  create_date_time?: string | null,
  end_date_time?: string | null,
  call_id?: string | null,
  external_meeting_id?: string | null,
  meeting_status?: string | null,
  meeting_title?: string | null,
  meeting_comments?: string | null,
  location?: GeolocationCoordinates,
};

export type Attendee = {
  __typename: "Attendee",
  phone_number?: string | null,
  attendee_id?: string | null,
  attendee_type?: AttendeeType | null,
  attendee_join_type?: AttendeeJoinType | null,
  attendee_state?: AttendeeState | null,
  user_role?: string | null,
  organization?: string | null,
  first_name?: string | null,
  last_name?: string | null,
  username?: string | null,
  location?: GeolocationCoordinates,
};

export type NotifySpecialistInput = {
  specialist?: SpecialistProfileInput | null,
  external_meeting_id?: string | null,
};

export type JoinMeetingInput = {
  meeting_id?: string | null,
  phone_number: string,
  user_name?: string | null,
  attendee_type?: AttendeeType | null,
};

export type JoinMeetingInfo = {
  __typename: "JoinMeetingInfo",
  meeting_id?: string | null,
  attendee_id?: string | null,
  external_user_id?: string | null,
  join_token?: string | null,
  media_placement?: MediaPlacement,
  media_region?: string | null,
};

export type MediaPlacement = {
  __typename: "MediaPlacement",
  AudioFallbackUrl?: string | null,
  AudioHostUrl?: string | null,
  ScreenDataUrl?: string | null,
  ScreenSharingUrl?: string | null,
  ScreenViewingUrl?: string | null,
  SignalingUrl?: string | null,
  TurnControlUrl?: string | null,
};

export type EndMeetingInput = {
  meeting_id?: string | null,
};

export type SpecialistConnection = {
  __typename: "SpecialistConnection",
  items?:  Array<SpecialistProfile | null > | null,
  nextToken?: string | null,
};

export type ModelMeetingDetailFilterInput = {
  meeting_id?: ModelStringInput | null,
  attendees?: ModelStringInput | null,
  create_date_time?: ModelStringInput | null,
  end_date_time?: string | null,
  call_id?: ModelStringInput | null,
  external_meeting_id?: ModelStringInput | null,
  meeting_status?: ModelStringInput | null,
  meeting_title?: ModelStringInput | null,
  meeting_comments?: ModelStringInput | null,
  and?: Array< ModelMeetingDetailFilterInput | null > | null,
  or?: Array< ModelMeetingDetailFilterInput | null > | null,
  not?: ModelMeetingDetailFilterInput | null,
};

export type MeetingDetailConnection = {
  __typename: "MeetingDetailConnection",
  items?:  Array<MeetingDetail | null > | null,
  nextToken?: string | null,
};

export type ServiceDeskProfile = {
  __typename: "ServiceDeskProfile",
  name?: string | null,
  phone_number?: string | null,
  email?: string | null,
  username?: string | null,
};

export type CreateSpecialistProfileMutationVariables = {
  input?: SpecialistProfileInput,
};

export type CreateSpecialistProfileMutation = {
  createSpecialistProfile?:  {
    __typename: "SpecialistProfile",
    email?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    phone_number: string,
    user_role?: string | null,
    organization?: string | null,
    profile_picture?: string | null,
    notes?: string | null,
    user_status?: SpecialistStatus | null,
    call_status?: SpecialistCallStatus | null,
    availability?:  {
      __typename: "SpecialistAvailability",
      overrides?:  Array< {
        __typename: "SpecialistAvalabilityOverride",
        start_time?: string | null,
        end_time?: string | null,
        override_type?: SpecialistStatus | null,
      } | null > | null,
      schedules?:  Array< {
        __typename: "SpecialistAvalabilityOverride",
        start_time?: string | null,
        end_time?: string | null,
        override_type?: SpecialistStatus | null,
      } | null > | null,
    } | null,
    created_date_time?: string | null,
    updated_date_time?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type UpdateSpecialistProfileMutationVariables = {
  input?: SpecialistProfileInput,
};

export type UpdateSpecialistProfileMutation = {
  updateSpecialistProfile?:  {
    __typename: "SpecialistProfile",
    email?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    phone_number: string,
    user_role?: string | null,
    organization?: string | null,
    profile_picture?: string | null,
    notes?: string | null,
    user_status?: SpecialistStatus | null,
    call_status?: SpecialistCallStatus | null,
    availability?:  {
      __typename: "SpecialistAvailability",
      overrides?:  Array< {
        __typename: "SpecialistAvalabilityOverride",
        start_time?: string | null,
        end_time?: string | null,
        override_type?: SpecialistStatus | null,
      } | null > | null,
      schedules?:  Array< {
        __typename: "SpecialistAvalabilityOverride",
        start_time?: string | null,
        end_time?: string | null,
        override_type?: SpecialistStatus | null,
      } | null > | null,
    } | null,
    created_date_time?: string | null,
    updated_date_time?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type DeleteSpecialistProfileMutationVariables = {
  input?: SpecialistProfileInput,
};

export type DeleteSpecialistProfileMutation = {
  deleteSpecialistProfile?:  {
    __typename: "SpecialistProfile",
    email?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    phone_number: string,
    user_role?: string | null,
    organization?: string | null,
    profile_picture?: string | null,
    notes?: string | null,
    user_status?: SpecialistStatus | null,
    call_status?: SpecialistCallStatus | null,
    availability?:  {
      __typename: "SpecialistAvailability",
      overrides?:  Array< {
        __typename: "SpecialistAvalabilityOverride",
        start_time?: string | null,
        end_time?: string | null,
        override_type?: SpecialistStatus | null,
      } | null > | null,
      schedules?:  Array< {
        __typename: "SpecialistAvalabilityOverride",
        start_time?: string | null,
        end_time?: string | null,
        override_type?: SpecialistStatus | null,
      } | null > | null,
    } | null,
    created_date_time?: string | null,
    updated_date_time?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type CreateMeetingDetailMutationVariables = {
  input?: MeetingDetailInput | null,
  condition?: ModelMeetingDetailConditionInput | null,
};

export type CreateMeetingDetailMutation = {
  createMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
      attendee_state?: AttendeeState | null,
      user_role?: string | null,
      organization?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      username?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
    meeting_title?: string | null,
    meeting_comments?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type UpdateMeetingDetailMutationVariables = {
  input?: MeetingDetailInput | null,
  condition?: ModelMeetingDetailConditionInput | null,
};

export type UpdateMeetingDetailMutation = {
  updateMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
      attendee_state?: AttendeeState | null,
      user_role?: string | null,
      organization?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      username?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
    meeting_title?: string | null,
    meeting_comments?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type DeleteMeetingDetailMutationVariables = {
  input?: MeetingDetailInput | null,
  condition?: ModelMeetingDetailConditionInput | null,
};

export type DeleteMeetingDetailMutation = {
  deleteMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
      attendee_state?: AttendeeState | null,
      user_role?: string | null,
      organization?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      username?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
    meeting_title?: string | null,
    meeting_comments?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type PublishNewMeetingDetailMutationVariables = {
  input?: MeetingDetailInput,
};

export type PublishNewMeetingDetailMutation = {
  publishNewMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
      attendee_state?: AttendeeState | null,
      user_role?: string | null,
      organization?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      username?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
    meeting_title?: string | null,
    meeting_comments?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type PublishMeetingDetailUpdatesMutationVariables = {
  input?: MeetingDetailInput,
};

export type PublishMeetingDetailUpdatesMutation = {
  publishMeetingDetailUpdates?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
      attendee_state?: AttendeeState | null,
      user_role?: string | null,
      organization?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      username?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
    meeting_title?: string | null,
    meeting_comments?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type NotifySpecialistMutationVariables = {
  input?: NotifySpecialistInput | null,
};

export type NotifySpecialistMutation = {
  notifySpecialist?: boolean | null,
};

export type JoinMeetingMutationVariables = {
  input?: JoinMeetingInput | null,
};

export type JoinMeetingMutation = {
  joinMeeting?:  {
    __typename: "JoinMeetingInfo",
    meeting_id?: string | null,
    attendee_id?: string | null,
    external_user_id?: string | null,
    join_token?: string | null,
    media_placement?:  {
      __typename: "MediaPlacement",
      AudioFallbackUrl?: string | null,
      AudioHostUrl?: string | null,
      ScreenDataUrl?: string | null,
      ScreenSharingUrl?: string | null,
      ScreenViewingUrl?: string | null,
      SignalingUrl?: string | null,
      TurnControlUrl?: string | null,
    } | null,
    media_region?: string | null,
  } | null,
};

export type EndMeetingMutationVariables = {
  input?: EndMeetingInput | null,
};

export type EndMeetingMutation = {
  endMeeting?: boolean | null,
};

export type GetSpecialistProfileQueryVariables = {
  phoneNumber?: string,
};

export type GetSpecialistProfileQuery = {
  getSpecialistProfile?:  {
    __typename: "SpecialistProfile",
    email?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    phone_number: string,
    user_role?: string | null,
    organization?: string | null,
    profile_picture?: string | null,
    notes?: string | null,
    user_status?: SpecialistStatus | null,
    call_status?: SpecialistCallStatus | null,
    availability?:  {
      __typename: "SpecialistAvailability",
      overrides?:  Array< {
        __typename: "SpecialistAvalabilityOverride",
        start_time?: string | null,
        end_time?: string | null,
        override_type?: SpecialistStatus | null,
      } | null > | null,
      schedules?:  Array< {
        __typename: "SpecialistAvalabilityOverride",
        start_time?: string | null,
        end_time?: string | null,
        override_type?: SpecialistStatus | null,
      } | null > | null,
    } | null,
    created_date_time?: string | null,
    updated_date_time?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type ListSpecialistProfilesByStatusQueryVariables = {
  userStatus?: SpecialistStatus | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSpecialistProfilesByStatusQuery = {
  listSpecialistProfilesByStatus?:  {
    __typename: "SpecialistConnection",
    items?:  Array< {
      __typename: "SpecialistProfile",
      email?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      phone_number: string,
      user_role?: string | null,
      organization?: string | null,
      profile_picture?: string | null,
      notes?: string | null,
      user_status?: SpecialistStatus | null,
      call_status?: SpecialistCallStatus | null,
      availability?:  {
        __typename: "SpecialistAvailability",
        overrides?:  Array< {
          __typename: "SpecialistAvalabilityOverride",
          start_time?: string | null,
          end_time?: string | null,
          override_type?: SpecialistStatus | null,
        } | null > | null,
        schedules?:  Array< {
          __typename: "SpecialistAvalabilityOverride",
          start_time?: string | null,
          end_time?: string | null,
          override_type?: SpecialistStatus | null,
        } | null > | null,
      } | null,
      created_date_time?: string | null,
      updated_date_time?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetSpecialistProfilesByStatusQueryVariables = {
  userStatus?: SpecialistStatus | null,
};

export type GetSpecialistProfilesByStatusQuery = {
  getSpecialistProfilesByStatus?:  {
    __typename: "SpecialistConnection",
    items?:  Array< {
      __typename: "SpecialistProfile",
      email?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      phone_number: string,
      user_role?: string | null,
      organization?: string | null,
      profile_picture?: string | null,
      notes?: string | null,
      user_status?: SpecialistStatus | null,
      call_status?: SpecialistCallStatus | null,
      availability?:  {
        __typename: "SpecialistAvailability",
        overrides?:  Array< {
          __typename: "SpecialistAvalabilityOverride",
          start_time?: string | null,
          end_time?: string | null,
          override_type?: SpecialistStatus | null,
        } | null > | null,
        schedules?:  Array< {
          __typename: "SpecialistAvalabilityOverride",
          start_time?: string | null,
          end_time?: string | null,
          override_type?: SpecialistStatus | null,
        } | null > | null,
      } | null,
      created_date_time?: string | null,
      updated_date_time?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type ListSpecialistProfilesQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSpecialistProfilesQuery = {
  listSpecialistProfiles?:  {
    __typename: "SpecialistConnection",
    items?:  Array< {
      __typename: "SpecialistProfile",
      email?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      phone_number: string,
      user_role?: string | null,
      organization?: string | null,
      profile_picture?: string | null,
      notes?: string | null,
      user_status?: SpecialistStatus | null,
      call_status?: SpecialistCallStatus | null,
      availability?:  {
        __typename: "SpecialistAvailability",
        overrides?:  Array< {
          __typename: "SpecialistAvalabilityOverride",
          start_time?: string | null,
          end_time?: string | null,
          override_type?: SpecialistStatus | null,
        } | null > | null,
        schedules?:  Array< {
          __typename: "SpecialistAvalabilityOverride",
          start_time?: string | null,
          end_time?: string | null,
          override_type?: SpecialistStatus | null,
        } | null > | null,
      } | null,
      created_date_time?: string | null,
      updated_date_time?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetMeetingDetailQueryVariables = {
  meetingId?: string,
};

export type GetMeetingDetailQuery = {
  getMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
      attendee_state?: AttendeeState | null,
      user_role?: string | null,
      organization?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      username?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
    meeting_title?: string | null,
    meeting_comments?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type ListMeetingDetailsQueryVariables = {
  filter?: ModelMeetingDetailFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListMeetingDetailsQuery = {
  listMeetingDetails?:  {
    __typename: "MeetingDetailConnection",
    items?:  Array< {
      __typename: "MeetingDetail",
      meeting_id: string,
      attendees?:  Array< {
        __typename: "Attendee",
        phone_number?: string | null,
        attendee_id?: string | null,
        attendee_type?: AttendeeType | null,
        attendee_join_type?: AttendeeJoinType | null,
        attendee_state?: AttendeeState | null,
        user_role?: string | null,
        organization?: string | null,
        first_name?: string | null,
        last_name?: string | null,
        username?: string | null,
        location?:  {
          __typename: "GeolocationCoordinates",
          latitude?: number | null,
          longitude?: number | null,
        } | null,
      } | null > | null,
      create_date_time?: string | null,
      end_date_time?: string | null,
      call_id?: string | null,
      external_meeting_id?: string | null,
      meeting_status?: string | null,
      meeting_title?: string | null,
      meeting_comments?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetMeetingDetailsByStatusQueryVariables = {
  meetingStatus?: string,
  limit?: number | null,
  nextToken?: string | null,
};

export type GetMeetingDetailsByStatusQuery = {
  getMeetingDetailsByStatus?:  {
    __typename: "MeetingDetailConnection",
    items?:  Array< {
      __typename: "MeetingDetail",
      meeting_id: string,
      attendees?:  Array< {
        __typename: "Attendee",
        phone_number?: string | null,
        attendee_id?: string | null,
        attendee_type?: AttendeeType | null,
        attendee_join_type?: AttendeeJoinType | null,
        attendee_state?: AttendeeState | null,
        user_role?: string | null,
        organization?: string | null,
        first_name?: string | null,
        last_name?: string | null,
        username?: string | null,
        location?:  {
          __typename: "GeolocationCoordinates",
          latitude?: number | null,
          longitude?: number | null,
        } | null,
      } | null > | null,
      create_date_time?: string | null,
      end_date_time?: string | null,
      call_id?: string | null,
      external_meeting_id?: string | null,
      meeting_status?: string | null,
      meeting_title?: string | null,
      meeting_comments?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetMeetingDetailsByStatusAndCreateTimeQueryVariables = {
  meetingStatus?: string,
  startTime?: string,
  endTime?: string,
  limit?: number | null,
  nextToken?: string | null,
};

export type GetMeetingDetailsByStatusAndCreateTimeQuery = {
  getMeetingDetailsByStatusAndCreateTime?:  {
    __typename: "MeetingDetailConnection",
    items?:  Array< {
      __typename: "MeetingDetail",
      meeting_id: string,
      attendees?:  Array< {
        __typename: "Attendee",
        phone_number?: string | null,
        attendee_id?: string | null,
        attendee_type?: AttendeeType | null,
        attendee_join_type?: AttendeeJoinType | null,
        attendee_state?: AttendeeState | null,
        user_role?: string | null,
        organization?: string | null,
        first_name?: string | null,
        last_name?: string | null,
        username?: string | null,
        location?:  {
          __typename: "GeolocationCoordinates",
          latitude?: number | null,
          longitude?: number | null,
        } | null,
      } | null > | null,
      create_date_time?: string | null,
      end_date_time?: string | null,
      call_id?: string | null,
      external_meeting_id?: string | null,
      meeting_status?: string | null,
      meeting_title?: string | null,
      meeting_comments?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetServiceDeskProfileQueryVariables = {
  username?: string,
};

export type GetServiceDeskProfileQuery = {
  getServiceDeskProfile?:  {
    __typename: "ServiceDeskProfile",
    name?: string | null,
    phone_number?: string | null,
    email?: string | null,
    username?: string | null,
  } | null,
};

export type OnCreateMeetingDetailSubscription = {
  onCreateMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
      attendee_state?: AttendeeState | null,
      user_role?: string | null,
      organization?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      username?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
    meeting_title?: string | null,
    meeting_comments?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type OnUpdateMeetingDetailSubscription = {
  onUpdateMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
      attendee_state?: AttendeeState | null,
      user_role?: string | null,
      organization?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      username?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
    meeting_title?: string | null,
    meeting_comments?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

export type OnDeleteMeetingDetailSubscription = {
  onDeleteMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
      attendee_state?: AttendeeState | null,
      user_role?: string | null,
      organization?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      username?: string | null,
      location?:  {
        __typename: "GeolocationCoordinates",
        latitude?: number | null,
        longitude?: number | null,
      } | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
    meeting_title?: string | null,
    meeting_comments?: string | null,
    location?:  {
      __typename: "GeolocationCoordinates",
      latitude?: number | null,
      longitude?: number | null,
    } | null,
  } | null,
};

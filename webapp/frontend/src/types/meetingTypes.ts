import { RosterAttendeeType } from "amazon-chime-sdk-component-library-react/lib/types";
import { AttendeeType } from "../common/types/API";

export type AttendeeDetails = RosterAttendeeType & { user_role: string; attendee_type: AttendeeType; };

// eslint-disable-next-line no-shadow
export enum ConnectionState {
    POOR,
    FAIR,
    GOOD,
    UNKNOWN
  }
import {
  Roster,
  RosterAttendee,
  RosterGroup,
  RosterHeader,
  MicrophoneActivity,
} from "amazon-chime-sdk-component-library-react";
import { RosterType } from "amazon-chime-sdk-component-library-react/lib/types";
import { ReactElement } from "react";
import { AttendeeDetails } from "../../types/meetingTypes";
import "./RosterDisplay.css";

export const RosterDisplay = ({
  attendees,
  roster,
}: {
  attendees: AttendeeDetails[];
  roster: RosterType;
}): ReactElement => {
  const attendeeItems = attendees.map((attendee) => {
    const { chimeAttendeeId, user_role, attendee_type } = attendee;

    if (!roster[chimeAttendeeId] || !chimeAttendeeId) return null;

    return (
      <RosterAttendee
        subtitle={user_role ? user_role : attendee_type}
        key={chimeAttendeeId}
        attendeeId={chimeAttendeeId}
        microphone={<MicrophoneActivity attendeeId={chimeAttendeeId} />}
      />
    );
  });

  const attendeeItemsLeft = attendees.map((attendee) => {
    const { chimeAttendeeId, user_role, attendee_type  } = attendee;

    if (!roster[chimeAttendeeId]) {
      return (
        <RosterAttendee
          subtitle={user_role ? user_role : attendee_type}
          key={chimeAttendeeId}
          attendeeId={chimeAttendeeId}
          microphone={<div />}
        />
      );
    } else return null;
  });

  const rosterJSON = JSON.parse(JSON.stringify(roster));

  return (
    <Roster className="roster">
      <RosterHeader title="Present" badge={Object.keys(rosterJSON).length} />
      <RosterGroup>{attendeeItems}</RosterGroup>
      <RosterHeader title="Left" />
      <RosterGroup>{attendeeItemsLeft}</RosterGroup>
    </Roster>
  );
};
export default RosterDisplay;

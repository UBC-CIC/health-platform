import { useState } from "react";
import { Button } from "react-bootstrap";
import { MeetingView } from "./MeetingView";
import {
  faPhoneAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const JoinMeeting = (props: {
  meetingId?: string;
  externalMeetingId?: string|null;
}) => {
  const [show, setShow] = useState(false);
  const {meetingId, externalMeetingId} = props;

  const onCheckIn = () => {
    console.log("check in");
    
    setShow(true);
  };

  const handleMeetingEnd = () => {
    setShow(false);
  }

  return (
    <>
      <Button variant="warning" title="Check In" onClick={() => onCheckIn()}>
        <FontAwesomeIcon icon={faPhoneAlt} />{"  "}
      </Button>

      {show && meetingId && externalMeetingId && <MeetingView meetingId={meetingId} externalMeetingId={externalMeetingId} handleMeetingEnd={handleMeetingEnd}/>}

    </>
  );
};

export default JoinMeeting;

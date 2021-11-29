import React, { useState } from "react";
import { Button } from "react-bootstrap";
import {
  faPhoneAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MapMeetingView from "./MapMeetingView";
import { UserContextType } from "../../context/UserContext";

const MapJoinMeetingButton = (props: {
    meetingId?: string;
    externalMeetingId?: string|null;
    user: UserContextType;
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

      {show && meetingId && externalMeetingId && <MapMeetingView user={props.user} meetingId={meetingId} externalMeetingId={externalMeetingId} handleMeetingEnd={handleMeetingEnd}/>}

    </>
  );
};

export default MapJoinMeetingButton;

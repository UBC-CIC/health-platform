import { faClipboard, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { userInfo } from "node:os";
import React from "react";
import { Button } from "react-bootstrap";
import ReactDOM from "react-dom";
import { MeetingDetail } from "../../common/types/API";
import { UserContextType } from "../../context/UserContext";
import MeetingNotes from "../common/MeetingNotes";
import Specialists from "../common/Specialists";
import JoinMeeting from "../meeting/JoinMeeting";
import MapJoinMeetingButton from "./MapJoinMeetingButton";
import "./MeetingMap.css";

type MeetingBubbleProps = {
  meeting: MeetingDetail;
  user: UserContextType;
};

const MeetingBubble = (props: MeetingBubbleProps) => {
  const { meeting, user } = props;
  const {
    meeting_title,
    external_meeting_id,
    create_date_time,
    meeting_status,
    meeting_id,
  } = props.meeting;

  return (
    <div className="meeting-bubble">
      <div className="title">{meeting_title || "Unnamed Meeting"}</div>
      <div className="subtitle">{external_meeting_id}</div>
      <div>
        {create_date_time !== undefined && create_date_time !== null
          ? new Date(create_date_time).toLocaleTimeString([], {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : create_date_time}
      </div>
      <div className="actions">
        {meeting_status === "ACTIVE" ? (
          <div className="action-buttons">
            <Specialists
              status="AVAILABLE"
              external_meeting_id={external_meeting_id}
            />{" "}
            <MapJoinMeetingButton
              user={user}
              externalMeetingId={external_meeting_id}
              meetingId={meeting_id}
            />
            <MeetingNotes meetingDetail={meeting} />{" "}
          </div>
        ) : (
          <div>
            <Button variant="light" title="Meeting Notes">
              <FontAwesomeIcon icon={faClipboard} />
              {"  "}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingBubble;

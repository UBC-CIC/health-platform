import "./MeetingList.css";
import { ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faMapMarkerAlt
  } from "@fortawesome/free-solid-svg-icons"
import { MeetingDetail } from "../../common/types/API";
type MeetingListProps = {
  meetings: MeetingDetail[];
  zoom: (location: GeolocationCoordinates) => void
};

const MeetingList = ({ meetings, zoom}: MeetingListProps) => {

  return (
    <ListGroup className="meeting-list-root">
      {meetings.map((detail) => {
        return (
          <ListGroup.Item>
            <div className="flex row align justify meeting-list-icon">
              <FontAwesomeIcon icon={faTimes}/>
              <div className="flex col">
                <div className="title">{detail.meeting_title || "Unnamed Meeting"}</div>
                <div className="list-subtitle subtitle">
                  {detail.external_meeting_id}
                </div>
              </div>
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

export default MeetingList;

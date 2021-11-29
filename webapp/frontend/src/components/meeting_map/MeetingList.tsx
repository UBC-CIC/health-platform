import "./MeetingList.css";
import { ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faMapMarkerAlt
  } from "@fortawesome/free-solid-svg-icons"
import { GeolocationCoordinates, MeetingDetail } from "../../common/types/API";
type MeetingListProps = {
  meetings: MeetingDetail[];
  zoom: (location: GeolocationCoordinates) => void
};

const MeetingList = ({ meetings, zoom}: MeetingListProps) => {


    const handleClick = (detail: MeetingDetail) => {
        if (detail.location) {
            zoom(detail.location)
        }
    }

  return (
    <ListGroup className="meeting-list-root">
      {meetings.map((detail) => {
        return (
          <ListGroup.Item action href={detail.location ? undefined : "/dashboard"} onClick={() => handleClick(detail)}>
            <div className="flex row align justify meeting-list-icon">
              <FontAwesomeIcon icon={detail.location ? faMapMarkerAlt : faTimes}/>
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

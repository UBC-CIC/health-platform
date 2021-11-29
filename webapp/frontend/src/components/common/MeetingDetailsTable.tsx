import { useEffect, useState } from "react";
import {
  faUser,
  faHeadset,
  faMapMarkerAlt,
  faRocket,
  faPhoneAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Table,
  Badge,
  Button,
  OverlayTrigger,
  Popover,
  Container,
  Row,
  Col,
  Tooltip,
} from "react-bootstrap";
import {
  MeetingDetail
} from "../../common/types/API";
import "./meetingDetailsTable.css";
import { API } from "aws-amplify";
import MeetingNotes from "./MeetingNotes";
import {
  updateMeetingDetail,
  endMeeting
} from "../../common/graphql/mutations";
import reverse from "reverse-geocode";

export const MeetingDetailsTable = (props: { items: Array<MeetingDetail> }) => {
  const [currTime, setCurrTime] = useState(new Date());

  useEffect(() => {
    setTimeout(() => setCurrTime(new Date()), 1000);
  });

  const timeSince = (start: string, end: string | null | undefined) => {
    let actualStart = new Date(start);
    let actualEnd = currTime;
    if (end) {
      actualEnd = new Date(end);
    }

    let secs = (actualEnd.getTime() - actualStart.getTime()) / 1000;
    var hours = Math.floor(secs / 3600);
    var minutes = Math.floor(secs / 60) % 60;
    var seconds = Math.floor(secs % 60);
    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  const onModifyTitle = async (meetingDetail: MeetingDetail, event: any) => {
    event.preventDefault();
    event.stopPropagation();
    const updatedTitle = event.target.innerText;
    meetingDetail.meeting_title = updatedTitle;

    try {
      const data: any = await API.graphql({
        query: updateMeetingDetail,
        variables: { input: meetingDetail },
      });
    } catch (e) {
      console.log("Mutation returned error", e);
    }
  };

  const onEndMeeting = async (meetingId?: string | null) => {
    try {
      console.log("End meeting " + meetingId);

      let res = await API.graphql({
        query: endMeeting,
        variables: {
          input: {
            meeting_id: meetingId
          },
        },
      });
    } catch (e: any) {
      console.log("End meeting errors:", e.errors);
    }
  };

  const getLocation = (location?: GeolocationCoordinates) => {
    if (!location?.latitude || !location?.longitude) return "Unknown Location";
    const { latitude, longitude } = location;
    return reverse.lookup(latitude, longitude, "ca").region;
  };

  return (
    <div className="meeting-table">
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Meeting ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Attendees</th>
            <th>Action</th>
            <th>Start Time</th>
            <th>Source</th>
            <th>Duration</th>
            <th>Service Desk Attendee</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item: MeetingDetail) => (
            <tr key={item.meeting_id}>
              <td>{item.external_meeting_id}</td>
              <td>
                <OverlayTrigger
                  trigger={["focus", "hover"]}
                  placement="bottom"
                  overlay={
                    <Popover id={`meeting-popover-${item.meeting_id}`}>
                      <Popover.Content>
                        Click to edit the meeting title
                      </Popover.Content>
                    </Popover>
                  }
                >
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className={item.meeting_title === "" ? "faint-text" : ""}
                    onBlur={(e) => onModifyTitle(item, e)}
                  >
                    {!item.meeting_title || item.meeting_title === ""
                      ? "Meeting"
                      : item.meeting_title}
                  </span>
                </OverlayTrigger>
              </td>
              <td>
                {item.meeting_status === "ACTIVE" ? (
                  <Badge variant="success">{item.meeting_status}</Badge>
                ) : (
                  <Badge variant="secondary">{item.meeting_status}</Badge>
                )}
              </td>
              {item.meeting_status === "ACTIVE" ? (
                <td>
                  <Button variant="danger" title="End Meeting" onClick={() => onEndMeeting(item.meeting_id)}>
                      <FontAwesomeIcon icon={faPhoneAlt} />{"  "}
                   </Button>{" "}
                  <MeetingNotes meetingDetail={item} />{" "}
                </td>
              ) : (
                <td>
                  <MeetingNotes meetingDetail={item} />{" "}
                </td>
              )}
              <td>
                {item.create_date_time !== undefined &&
                item.create_date_time !== null
                  ? new Date(item.create_date_time).toLocaleTimeString([], {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : item.create_date_time}
              </td>
              <td style={{ width: "64px" }}>
                {item.meeting_status === "ACTIVE" &&
                  item.create_date_time !== undefined &&
                  item.create_date_time !== null && (
                    <div style={{ width: "100px" }}>
                      {timeSince(item.create_date_time, null)}
                    </div>
                  )}
                {item.meeting_status !== "ACTIVE" &&
                  item.create_date_time !== undefined &&
                  item.create_date_time !== null &&
                  item.end_date_time !== undefined &&
                  item.end_date_time !== null && (
                    <div style={{ width: "100px" }}>
                      {timeSince(item.create_date_time, item.end_date_time)}
                    </div>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {props.items.length == 0 && (
        <Container className="no-calls-found">
          <Row className="justify-content-md-center no-calls-icon">
            <Col>
              <FontAwesomeIcon icon={faRocket} size="4x" color="#999999" />
            </Col>
          </Row>
          <Row className="justify-content-md-center">
            <Col>
              <span className="faint-text">No Calls Found</span>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

export default MeetingDetailsTable;

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
  AttendeeState,
  AttendeeType,
  MeetingDetail,
  GeolocationCoordinates
} from "../../common/types/API";
import Attendees from "./Attendees";
import Specialists from "./Specialists";
import JoinMeeting from "../meeting/JoinMeeting";
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

  const getServiceDeskAttendee = (item: MeetingDetail) => {
    if (item.attendees) {
      for (let attendee of item.attendees) {
        if (attendee?.attendee_type === AttendeeType.SERVICE_DESK) {
          return attendee.username;
        }
      }
    }
    return null;
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

  const handleKickUser = async (
    meetingDetail?: MeetingDetail | null,
    attendeeId?: string | null
  ): Promise<boolean> => {
    if (!meetingDetail?.attendees || !meetingDetail.meeting_id || !attendeeId) {
      console.error("KICKUSER: meetingDetail or Attendee id is null");
      return false;
    }

    const attendeesClone = Array.from(meetingDetail.attendees);
    const attendeeIndex = attendeesClone.findIndex(
      (attendee) => attendeeId === attendee?.attendee_id
    );
    if (attendeeIndex < 0 || !attendeesClone[attendeeIndex]) {
      console.error("KICKUSER: No attendee found with id", attendeeId);
      return false;
    }
    let kickedAttendee = attendeesClone[attendeeIndex];
    kickedAttendee!.attendee_state = AttendeeState.KICKED;
    attendeesClone[attendeeIndex] = kickedAttendee;
    try {
      const data: any = await API.graphql({
        query: updateMeetingDetail,
        variables: {
          input: {
            meeting_id: meetingDetail.meeting_id,
            attendees: attendeesClone,
          },
        },
      });
      console.log(
        `Kicked ${attendeeId} from ${meetingDetail.external_meeting_id}`
      );
      if (data.data) {
        return true;
      }
    } catch (e) {
      console.log("Mutation returned error", e);
      return false;
    }
    return false;
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
    } catch (e) {
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
              <td>
                {item.attendees &&
                item.attendees.filter(
                  (a) =>
                    a?.attendee_state === AttendeeState.IN_CALL ||
                    a?.attendee_state === AttendeeState.KICKED ||
                    a?.attendee_state === AttendeeState.PAGED
                ).length > 0 ? (
                  <Attendees
                    handleKick={async (attendeeId) => {
                      await handleKickUser(item, attendeeId);
                    }}
                    attendeeList={item.attendees.filter(
                      (a) =>
                        a?.attendee_state === AttendeeState.IN_CALL ||
                        a?.attendee_state === AttendeeState.KICKED ||
                        a?.attendee_state === AttendeeState.PAGED
                    )}
                  />
                ) : (
                  <div>
                    <Button variant="light" disabled>
                      <FontAwesomeIcon icon={faUser} />{" "}
                      <Badge pill variant="dark">
                        {0}
                      </Badge>
                    </Button>
                  </div>
                )}
              </td>
              {item.meeting_status === "ACTIVE" ? (
                <td>
                  <Specialists
                    status="AVAILABLE"
                    external_meeting_id={item.external_meeting_id}
                  />{" "}
                  <JoinMeeting 
                    meetingId={item.meeting_id} 
                    externalMeetingId={item.external_meeting_id}
                  />{" "}
                  <Button variant="danger" title="End Meeting" onClick={() => onEndMeeting(item.meeting_id)}>
                      <FontAwesomeIcon icon={faPhoneAlt} />{"  "}
                   </Button>{" "}
                  {item.location ? <OverlayTrigger
                    overlay={
                      <Tooltip id={`tooltip-${item.meeting_id}`}>
                        {getLocation(item.location)}
                      </Tooltip>
                    }
                  >
                    <Button
                      style={{ marginRight: ".3em" }}
                      variant={item.location ? "primary" : "secondary"}
                      title="End Meeting"
                      as="a"
                      href={`/map?lat=${item.location.latitude}&long=${item.location.longitude}`}
                    >
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </Button>
                  </OverlayTrigger> : null}
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
              <td>
                {item.attendees && item.attendees.length > 0 ? (
                  <>
                    {item.attendees[0]?.phone_number
                      ? item.attendees[0]?.phone_number
                      : "App"}
                  </>
                ) : (
                  <>Unknown</>
                )}
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
              <td>
                {getServiceDeskAttendee(item) ? (
                  <>
                    <FontAwesomeIcon icon={faHeadset} />{" "}
                    {getServiceDeskAttendee(item)}
                  </>
                ) : (
                  <Badge variant="danger">No Check-Ins</Badge>
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

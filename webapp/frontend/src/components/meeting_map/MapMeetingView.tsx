import { makeStyles } from "@material-ui/core";
import {
    useAudioVideo,
    useMeetingManager,
    useRosterState,
    VideoTileGrid
} from "amazon-chime-sdk-component-library-react";
import { MeetingSessionStatusCode } from "amazon-chime-sdk-js";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Col, Container, Modal, Row } from "react-bootstrap";
import { joinMeeting } from "../../common/graphql/mutations";
import { getServiceDeskProfile } from "../../common/graphql/queries";
import { AttendeeType, JoinMeetingInfo } from "../../common/types/API";
import { UserContextType } from "../../context/UserContext";
import { AttendeeDetails } from "../../types/meetingTypes";
import Spinner from "../common/Spinner";
import Chat from "../meeting/Chat";
import fetchMeetingAttendees from "../meeting/fetchMeetingAttendees";
import MeetingControls from "../meeting/MeetingControls";
import RosterDisplay from "../meeting/RosterDisplay";
import Colors from "../styling/Colors";
import "../meeting/MeetingView.css";

const useStyles = makeStyles({
  snackBar: {
    backgroundColor: Colors.theme.warning,
    color: Colors.theme.onyx,
  },
  suggestion: {
    backgroundColor: Colors.theme.error,
    color: Colors.theme.platinum,
  },
  videoGrid: {
    gridTemplateColumns: "1fr 1fr !important",
    gridTemplateRows: "1fr 1fr !important",
    maxHeight: "500px",
  },
  scrollContainer: {
    overflowY: "auto",
  },
  callContainer: {
    color: "white",
    paddingTop: "10px",
    paddingBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
  },
  selectText: { fontFamily: "Montserrat", textAlign: "center" },
});

export const MapMeetingView = (props: {
  meetingId: string;
  externalMeetingId: string;
  handleMeetingEnd: () => void;
  user: UserContextType;
}) => {
  const classes = useStyles();
  const audioVideo = useAudioVideo();
  const meetingManager = useMeetingManager();
  const { roster } = useRosterState();
  const [attendees, setAttendees] = useState([] as AttendeeDetails[]);
  const [attendeeId, setAttendeeId] = useState<string>();
  const user = props.user.user;
  const [show, setShow] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const { handleMeetingEnd } = props;

  const handleJoinMeeting = async () => {
    console.log("joining meeting");
    
    try {
      /** Get User data from DynamoDB */
      const userResponse: any = await API.graphql({
        query: getServiceDeskProfile,
        variables: {
          username: user.username,
        },
      });
      

      const fullName = userResponse.data?.getServiceDeskProfile.name;

      /** Join Chime Meeting through API call to Lambda function */
      const response: any = await API.graphql({
        query: joinMeeting,
        variables: {
          input: {
            meeting_id: props.meetingId,
            phone_number: userResponse.data?.getServiceDeskProfile.phone_number,
            user_name: user.username,
            attendee_type: AttendeeType.SERVICE_DESK,
          },
        },
      });

      console.log(response);
      

      const meetingInfoResponse: JoinMeetingInfo = response.data?.joinMeeting;

      if (meetingInfoResponse) {
        const meetingInfo = {
          MeetingId: props.meetingId,
          ExternalMeetingId: props.externalMeetingId,
          MediaRegion: meetingInfoResponse.media_region,
          MediaPlacement: meetingInfoResponse.media_placement,
        };
        const attendeeInfo = {
          AttendeeId: meetingInfoResponse.attendee_id,
          ExternalUserId: meetingInfoResponse.external_user_id,
          JoinToken: meetingInfoResponse.join_token,
          name: fullName,
        };

        meetingInfoResponse.attendee_id &&
          setAttendeeId(meetingInfoResponse.attendee_id);

        await meetingManager
          .join({ meetingInfo, attendeeInfo })
          .then(() => {
            if (response.data) {
              setCallStarted(true);
              console.log("success", response);
            } else {
              console.error("error joining the meeting: ", response.errors);
              handleClose();
            }
          })
          .catch((e) => {
            console.log("Error in meeting manager : ", e);
            handleClose();
          });
      } else {
        console.log("Could not join chime meeting");
        handleClose();
      }
    } catch (e) {
      console.log("error", e);
      
      console.error(e);
      handleClose();
    }
  };

  /** On mount join meeting */
  useEffect(() => {
    const f = async () => {
      await handleJoinMeeting();
    };
    f();

    meetingManager.getAttendee = async (chimeAttendeeId) => {
      try {
        if (!meetingManager.meetingId) {
          return Promise.resolve({ name: "Attendee" });
        }
        const res = await fetchMeetingAttendees({
          meeting_id: meetingManager.meetingId,
        });

        if (res.errors) {
          console.error(res.errors);
          return Promise.resolve({ name: "Attendee" });
        }
        const fetchedAttendees = res.data?.getMeetingDetail?.attendees;

        if (!fetchedAttendees) {
          return Promise.resolve({ name: "Attendee" });
        }

        const match = fetchedAttendees.find(
          (attendee) => attendee?.attendee_id === chimeAttendeeId
        );
        if (!match) return Promise.resolve({ name: "Attendee" });
        if (match.first_name) {
          const fullName = `${match.first_name} ${match.last_name}`;
          if (match) return Promise.resolve({ name: fullName });
        }
        return Promise.resolve({ name: "Attendee" });
      } catch (e) {
        console.error("Failed to get attendee's name: ", e);
        return Promise.resolve({ name: "Attendee" });
      }
    };

    return handleLeaveMeeting;
  }, []);

  /** On change of roster, update roster with name and role */
  useEffect(() => {
    const f = async () => {
      /** Get attendees from DB in order to tell their role */
      if (!meetingManager.meetingId) return;
      const newAtt = await fetchMeetingAttendees({
        meeting_id: meetingManager.meetingId,
      });

      if (newAtt.data?.getMeetingDetail?.attendees) {
        const items = newAtt.data.getMeetingDetail?.attendees?.map(
          (attendee) =>
            ({
              chimeAttendeeId: attendee?.attendee_id,
              ...attendee,
            } as AttendeeDetails)
        );
        setAttendees(items);
      }
    };
    if (meetingManager.meetingId) f();
  }, [meetingManager.meetingId, roster]);

  const handleLeaveMeeting = () => {
    meetingManager.leave();
  };

  const handleClose = () => {
    setShow(false);
    setCallStarted(false);
    handleMeetingEnd();
  };

  /** On change of audio/video when call starts */
  useEffect(() => {
    const f = async () => {
      /** Get and Bind User Devices to Chime Infrastructure */
      if (!meetingManager) return;

      /* Handle End of Meeting / Kicked from Meeting */
      meetingManager.audioVideoDidStop = (sessionStatus) => {
        const sessionStatusCode = sessionStatus.statusCode();
        if (sessionStatusCode === MeetingSessionStatusCode.MeetingEnded) {
          /*
        - You (or someone else) have called the DeleteMeeting API action in your server application.
        - You attempted to join a deleted meeting.
        - No audio connections are present in the meeting for more than five minutes.
        - Fewer than two audio connections are present in the meeting for more than 30 minutes.
        - Screen share viewer connections are inactive for more than 30 minutes.
        - The meeting time exceeds 24 hours.
        See https://docs.aws.amazon.com/chime/latest/dg/mtgs-sdk-mtgs.html for details.
      */
          console.log("The session has ended");
        } else {
          console.log(
            "Stopped with a session status code: ",
            sessionStatusCode,
            ":",
            MeetingSessionStatusCode[sessionStatusCode]
          );
        }
      };
      await meetingManager.start().catch((e) => {
        console.error(e);
        setShow(false);
        setCallStarted(false);
      });
      setShow(true);
    };

    f();
  }, [audioVideo, meetingManager]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-90w"
      backdrop="static"
      keyboard={false}
      className="meeting-modal"
    >
      <Modal.Header>
        <Container fluid>
          <Row>
            <Col>Meeting Id - {props.externalMeetingId}</Col>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body>
        {show && callStarted ? (
          <Container fluid className="video-container">
            <Row className="justify-content-md-center">
              <Col>
                <MeetingControls
                  meetingId={props.meetingId}
                  handleEndMeeting={handleClose}
                />
              </Col>
            </Row>
            <Row>
              <Col lg={8}>
                <VideoTileGrid
                  className={classes.videoGrid}
                  layout="standard"
                  noRemoteVideoView={
                    <div>
                      <div style={{ color: "black", minHeight: "300px" }}>
                        Nobody is sharing video at the moment
                      </div>
                    </div>
                  }
                />
              </Col>
              <Col lg={4}>
                <Row>
                  <Col>
                    <RosterDisplay roster={roster} attendees={attendees} />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Chat
                      attendeeId={attendeeId}
                      attendees={roster}
                      meetingId={props.meetingId}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        ) : (
          <Container>
            <Row className="justify-content-md-center">
              <Spinner />
            </Row>
          </Container>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default MapMeetingView;

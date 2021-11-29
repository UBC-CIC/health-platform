import { useHistory } from "react-router-dom";
import {
  ControlBarButton,
  Phone,
  useMeetingManager,
} from "amazon-chime-sdk-component-library-react";

const EndMeetingControl = (props:{meetingId: string, handleEndMeeting: () => void}) => {
  const meetingManager = useMeetingManager();
  const { meetingId } = props;
  const history = useHistory();

  const leaveMeeting = async (): Promise<void> => {
    try {
      if (meetingId) {
        await meetingManager.leave();
        props.handleEndMeeting();
        history.push("/");
      }
    } catch (e) {
      console.log("Could not leave meeting", e);
    }
  };

  return (
    <>
      <ControlBarButton icon={<Phone />} onClick={leaveMeeting} label="Leave" />
    </>
  );
};

export default EndMeetingControl;

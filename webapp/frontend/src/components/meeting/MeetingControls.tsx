import React from 'react';
import {
  ControlBar,
  AudioInputControl,
  VideoInputControl,
  ContentShareControl,
  AudioOutputControl,
  ControlBarButton,
  //useUserActivityState,
  Dots
} from 'amazon-chime-sdk-component-library-react';

import EndMeetingControl from './EndMeetingControl';
//import { useNavigation } from '../../providers/NavigationProvider';
import { StyledControls } from './Styled';

const MeetingControls = (props: {meetingId:string, handleEndMeeting: () => void}) => {
  //const { toggleNavbar, closeRoster, showRoster } = useNavigation();
  //const { isUserActive } = useUserActivityState();

  const handleToggle = () => {
    //if (showRoster) {
    //  closeRoster();
    //}

    //toggleNavbar();
  };

  return (
    <StyledControls className="controls" active={true}>
      <ControlBar
        className="controls-menu"
        layout="undocked-horizontal"
        showLabels
      >
        <ControlBarButton
          className="mobile-toggle"
          icon={<Dots />}
          onClick={handleToggle}
          label="Menu"
        />
        <AudioInputControl />
        <AudioOutputControl />
        <VideoInputControl />
        <ContentShareControl />
        <EndMeetingControl meetingId={props.meetingId} handleEndMeeting={props.handleEndMeeting}/>
      </ControlBar>
    </StyledControls>
  );
};

export default MeetingControls;

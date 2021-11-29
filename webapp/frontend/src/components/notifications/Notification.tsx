import { useEffect, useRef } from "react";
import NotificationSystem from "react-notification-system";
import Cookies from "universal-cookie";
import { API } from "aws-amplify";
import { onCreateMeetingDetail } from "../../common/graphql/subscriptions";
import { SOUNDS_DICTIONARY } from "./sounds/Sounds";
import {
  COOKIE_ALERT_SOUND,
  COOKIE_SOUND_STATUS,
  COOKIE_VOLUME,
} from "../settings/Settings";
import { Link } from "react-router-dom";

// TODO: Override style. To see what can properties be overridden see https://github.com/igorprado/react-notification-system/blob/master/src/styles.js
const style = {
  NotificationItem: {
    // Override the notification item
    DefaultStyle: {
      // Applied to every notification, regardless of the notification level
      margin: "10px 5px 2px 1px",
      background: "#eeeeee",
      fontSize: 12,
      fontWeight: 600,
    },

    success: {
      // Applied only to the success notification item
      color: "#33691E",
    },
  },
};

export const CallNotification = () => {
  const notificationSystemRef = useRef<NotificationSystem.System>(null);

  useEffect(() => {
    const subscribeCreateMeetings = () => {
      const subscription: any = API.graphql({
        query: onCreateMeetingDetail,
      });

      subscription.subscribe({
        next: (data: any) => {
          console.log("data received from create subscription:", data);
          if (
            data.value.data !== undefined &&
            data.value.data.onCreateMeetingDetail.meeting_status === "ACTIVE"
          ) {
            console.log("active call");
            const currentNotifications = notificationSystemRef.current;
            if (currentNotifications) {
              console.log("currentNotifications");
              currentNotifications.addNotification({
                message:
                  "New call in progress with meeting id : " +
                  data.value.data.onCreateMeetingDetail.external_meeting_id,
                level: "success",
                autoDismiss: 0,
                dismissible: "both",
                children: (
                  <div>
                    <Link
                      to="/dashboard"
                      onClick={() => {
                        window.location.pathname = "/dashboard";
                      }}
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                ),
              });
              const cookies = new Cookies();
              const soundCookie =
                cookies.get(COOKIE_SOUND_STATUS) === "false" ? false : true;
              const volumeCookie = cookies.get(COOKIE_VOLUME)
                ? cookies.get(COOKIE_VOLUME)
                : 50;
              const alertSoundCookie = cookies.get(COOKIE_ALERT_SOUND)
                ? cookies.get(COOKIE_ALERT_SOUND)
                : "beep";
              const alarmAudio = new Audio(
                SOUNDS_DICTIONARY.get(alertSoundCookie)
              );
              alarmAudio.volume = volumeCookie / 100;
              soundCookie && alarmAudio.play();
            }
          }
        },
      });
    };

    subscribeCreateMeetings();
  }, []);

  return (
    <div>
      <NotificationSystem style={style} ref={notificationSystemRef} />
    </div>
  );
};

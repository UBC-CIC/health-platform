import {
  Hamburger,
  MeetingProvider,
  lightTheme,
} from "amazon-chime-sdk-component-library-react";
import { API, Auth } from "aws-amplify";
import Location from "aws-sdk/clients/location";
import mapboxgl from "mapbox-gl";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Accordion, Collapse } from "react-bootstrap";
import ReactDOM from "react-dom";
import { useLocation, useParams } from "react-router";
import { ThemeProvider } from "styled-components";
import { getMeetingDetailsByStatus } from "../../common/graphql/queries";
import {
  onCreateMeetingDetail,
  onUpdateMeetingDetail,
} from "../../common/graphql/subscriptions";
import {
  AttendeeType,
  GeolocationCoordinates,
  MeetingDetail,
} from "../../common/types/API";
import UserContext from "../../context/UserContext";
import LocationServiceHelper from "./LocationHelper";
import MeetingBubble from "./MeetingBubble";
import MeetingList from "./MeetingList";
import "./MeetingMap.css";

let credentials;
let locationService: Location;

const locationHelper = new LocationServiceHelper();

const getLocationService = async () => {
  credentials = await Auth.currentCredentials();
  locationService = new Location({
    credentials,
    region: "us-east-1",
  });
};

/** TODO: Cache map (somehow) so it isn't rebuilt on every re-render  */
const constructMap = async (
  container: HTMLDivElement,
  setFunction: Function,
  callback: (builtMap: mapboxgl.Map) => void
) => {
  const center = new mapboxgl.LngLat(-106.3468, 56.1304);
  const map = await locationHelper.constructMapWithCenter(container, center);
  setFunction(() => map);
  map.addControl(
    new mapboxgl.NavigationControl({ showCompass: false }),
    "top-left"
  );
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      fitBoundsOptions: {
        zoom: 15,
      },
      trackUserLocation: true,
      showAccuracyCircle: false,
      showUserLocation: true,
    })
  );

  map.addControl(new mapboxgl.FullscreenControl());

  callback(map);
};

const filterMeetingsByLocation = (meetings: MeetingDetail[]) => {
  return (meetings as MeetingDetail[]).filter((meeting) => !!meeting.location);
};

const clearMarkersFromMap = (markers: mapboxgl.Marker[]) => {
  markers.forEach((marker) => marker.remove());
};

const useQuery = () => {
  const params = new URLSearchParams(useLocation().search);
  return params;
}

const MapPage = () => {
  const params = useQuery();
  const initLat = parseFloat(params.get("lat") || "");
  const initLong = parseFloat(params.get("long") || "");
  const [container, setContainer] = useState<
    HTMLDivElement | null | undefined
  >();
  const user = useContext(UserContext);
  const [map, setMap] = useState<mapboxgl.Map | undefined>();
  const [items, updateItems] = useState<Array<MeetingDetail>>(
    new Array<MeetingDetail>()
  );

  /** Invariant: meetingsWithLocation.length == markers.length */
  const [meetingsWithLocation, setMeetingsWithLocation] = useState<
    MeetingDetail[]
  >([]);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const stateRef = useRef<Array<MeetingDetail>>();
  stateRef.current = items;
  const [listOpen, setListOpen] = useState(true);

  const handleZoom = (location: GeolocationCoordinates) => {
    if (location.latitude && location.longitude)
      map?.flyTo({
        center: [location.longitude, location.latitude],
        essential: false,
        animate: true,
        duration: 1000,
        zoom: 15,
      });
  };

  /** Graphql Subscription Setup */
  useEffect(() => {
    async function subscribeCreateMeetings() {
      const subscription: any = API.graphql({
        query: onCreateMeetingDetail,
      });

      subscription.subscribe({
        next: (data: any) => {
          console.log("OnCreate");
          console.log(data);

          const newItems = [];
          let found = false;
          if (data.value.data) {
            for (let item of stateRef.current!) {
              if (
                data.value.data.onCreateMeetingDetail.meeting_id ===
                item.meeting_id
              ) {
                // Found existing item so we will update this item
                newItems.push(data.value.data.onCreateMeetingDetail);
                found = true;
              } else {
                // Keep existing item
                newItems.push(item);
              }
            }
            if (!found) {
              newItems.push(data.value.data.onCreateMeetingDetail);
            }
            console.log("Got new items: ", newItems);
            const filteredMeetings = filterMeetingsByLocation(newItems);
            console.log("Got new meetings: ", filteredMeetings);

            setMeetingsWithLocation(() => filteredMeetings);
            console.log("Set meetings: ", filteredMeetings);

            updateItems(newItems);
          }
        },
        error: (error: any) => console.warn(error),
      });
    }

    async function subscribeUpdateMeetings() {
      const subscription: any = API.graphql({
        query: onUpdateMeetingDetail,
      });

      subscription.subscribe({
        next: (data: any) => {
          console.log("onUpdate");

          const newItems = [];
          if (data.value.data.onUpdateMeetingDetail) {
            for (let item of stateRef.current!) {
              if (
                data.value.data.onUpdateMeetingDetail.meeting_id ===
                item.meeting_id
              ) {
                // Found existing item so we will update this item
                newItems.push(data.value.data.onUpdateMeetingDetail);
              } else {
                // Keep existing item
                newItems.push(item);
              }
            }
            const filteredMeetings = filterMeetingsByLocation(newItems);
            // console.log("Got new meetings: ", filteredMeetings);

            // setMeetingsWithLocation(() => filteredMeetings);
            // console.log("Set meetings: ", filteredMeetings);

            updateItems(newItems);
          }
        },
        error: (error: any) => console.warn(error),
      });
    }

    async function callListAllMeetings() {
      try {
        const meetings: any = await API.graphql({
          query: getMeetingDetailsByStatus,
          variables: {
            meetingStatus: "ACTIVE",
            limit: 25,
          },
        });
        const itemsReturned: Array<MeetingDetail> =
          meetings["data"]["getMeetingDetailsByStatus"]["items"];
        const filteredMeetings = filterMeetingsByLocation(itemsReturned);
        setMeetingsWithLocation(() => filteredMeetings);
        updateItems(itemsReturned);
      } catch (e) {
        console.log("getMeetingDetailsByStatus errors:", e.errors);
      }
    }

    callListAllMeetings();
    subscribeCreateMeetings();
    subscribeUpdateMeetings();

    console.log("Subscriptions ready");
  }, []);

  /** Set up mapbox ui, center on user's position or Canada on map*/
  useEffect(() => {
    const f = async () => {
      await getLocationService();
      if (!map)
        await constructMap(
          container as HTMLDivElement,
          setMap,
          (builtMap: mapboxgl.Map) => {
            navigator.geolocation.getCurrentPosition((pos) => {
              builtMap.flyTo({
                center: !isNaN(initLat) && !isNaN(initLong)
                ? [initLong, initLat]
                : [pos.coords.longitude, pos.coords.latitude],
                essential: false,
                animate: true,
                duration: 1000,
                zoom: 15,
              });
            });
          }
        );
    };

    if (container && !map) f();
  }, [container, map]);

  useEffect(() => {
    console.log("Re-rendering markers");

    console.table(meetingsWithLocation);

    if (!map || !meetingsWithLocation) return;
    /** Get only meetings with a location attached */

    /** Make markers with meeting locations */
    const newMarkers = meetingsWithLocation
      .map((meeting) => {
        if (!meeting.location?.longitude || !meeting.location.latitude) {
          console.warn(
            "No location found for meeting, id: ",
            meeting.external_meeting_id
          );
          return;
        }

        const { longitude, latitude } = meeting.location;
        let currMarker = new mapboxgl.Marker()
          .setLngLat([longitude, latitude])
          .addTo(map);
        let markerElement = currMarker.getElement();

        const placeholder = document.createElement("div");
        const meetingBubble = (
          <ThemeProvider theme={lightTheme}>
            <MeetingProvider>
              <MeetingBubble user={user} meeting={meeting} />
            </MeetingProvider>
          </ThemeProvider>
        );
        ReactDOM.render(meetingBubble, placeholder);
        currMarker.setPopup(
          new mapboxgl.Popup({ offset: 18 }).setDOMContent(placeholder)
        );

        markerElement.addEventListener("click", (e) => {
          e.stopPropagation();
          currMarker.togglePopup();
        });

        return currMarker;
      })
      .filter((item) => !!item);

    /** Redraw all the markers */
    clearMarkersFromMap(markers);
    console.table(newMarkers);

    setMarkers(() => newMarkers as mapboxgl.Marker[]);
  }, [meetingsWithLocation, map]);

  return (
    <div id={"mapPage"}>
      <div
        className="Map"
        ref={(x) => {
          setContainer(() => x);
        }}
      />
      <div
        className="meeting-list-button"
        onClick={() => {
          console.log("Click");
          setListOpen(() => !listOpen);
          console.log(listOpen);
        }}
      >
        <Hamburger />
      </div>
      <Collapse in={listOpen}>
        <div className="meeting-list">
          <MeetingList zoom={handleZoom} meetings={items} />
        </div>
      </Collapse>
    </div>
  );
};
export default MapPage;

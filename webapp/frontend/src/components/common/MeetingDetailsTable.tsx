import { useEffect, useState } from "react";
import {
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Container,
  Row,
  Col,
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

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
const faker = require('faker');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Line Chart',
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

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

  return (
    <div className="meeting-table">

        <Line options={options} data={data} />

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

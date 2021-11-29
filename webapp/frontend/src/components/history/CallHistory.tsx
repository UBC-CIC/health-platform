import { useEffect, useRef, useState } from "react";
import {
  Button,
  Col,
  Container,
  FormLabel,
  Form,
  OverlayTrigger,
  Popover,
  Row
} from "react-bootstrap";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API } from "aws-amplify";
import { getMeetingDetailsByStatusAndCreateTime } from "../../common/graphql/queries";
import Loading from "../common/Loading";
import MeetingDetailsTable from "../common/MeetingDetailsTable";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "./history.css";

const startDatePopover = (
  <Popover id="popover-basic">
    <Popover.Title as="h3">Select Date</Popover.Title>
    <Popover.Content>
      This is the start date time range for Meeting Start Time.
    </Popover.Content>
  </Popover>
);

const endDatePopover = (
  <Popover id="popover-basic">
    <Popover.Title as="h3">Select Date</Popover.Title>
    <Popover.Content>
      This is the end date time range for Meeting Start Time.
    </Popover.Content>
  </Popover>
);

const statusPopover = (
  <Popover id="popover-basic">
    <Popover.Title as="h3">Select Call Status</Popover.Title>
    <Popover.Content>Select the Call Status.</Popover.Content>
  </Popover>
);

export const CallHistory = () => {
  const [items, updateItems] = useState([]);
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(new Date());
  const statusRef = useRef<HTMLSelectElement>(null);
  const [prevTokens, updatePrevTokens] = useState<Array<String>>([]);
  const [prevToken, updatePrevToken] = useState<String>("");
  const [nextToken, updateNextToken] = useState<String>("");
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onSearch();
  }, []);

  const onNextPage = async () => {
    const nextTonkenValue = nextToken;
    if (nextTonkenValue) {
      await onGetHistoryByTimeRange(nextTonkenValue);
    }
    prevTokens.push(prevToken);
    updatePrevTokens(prevTokens);
    console.log("prevTokens from next : ", prevTokens);
    setPageNumber(pageNumber + 1);
  };

  const onPreviousPage = async () => {
    const previousTonkenValue = prevTokens.pop();
    updatePrevTokens(prevTokens);
    if (previousTonkenValue !== undefined) {
      await onGetHistoryByTimeRange(previousTonkenValue);
    }
    console.log("prevTokens from previous : ", prevTokens);
    items.length > 0 && setPageNumber(pageNumber - 1);
  };

  const onSearch = async () => {
    updatePrevTokens([]);
    await onGetHistoryByTimeRange("");
    console.log("prevTokens from search : ", prevTokens);
    if (items.length > 0) {
      setPageNumber(1);
    }
  };

  const onGetHistoryByTimeRange = async (token: String) => {
    try {
      setLoading(true);
      
      const meetingStatus = statusRef.current
        ? statusRef.current.value
        : "ACTIVE";
      
        const result: any = await API.graphql({
        query: getMeetingDetailsByStatusAndCreateTime,
        variables: {
          meetingStatus: meetingStatus,
          startTime: startDate,
          endTime: endDate,
          nextToken: token,
          limit: 25,
        },
      });
      
      const meetings : any = result["data"]["getMeetingDetailsByStatusAndCreateTime"];
      updateItems(meetings["items"]);
      updateNextToken(meetings["nextToken"]);
      updatePrevToken(token);
      
      setLoading(false);
    } catch (e) {
      console.log("getMeetingDetailsByStatusAndCreateTime errors:", e.errors);
    }
  };

  return (
    <Container fluid className="history-container">
      <Row className="history-search-row">
        <Col>
          <Form onSubmit={() => onSearch()}>
            <Row xs={1} md={4} lg={4}>
              <Col className="form-col">
                <FormLabel>
                  <span>Start Date </span>
                  <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="bottom"
                    overlay={startDatePopover}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </OverlayTrigger>
                </FormLabel>{" "}
                <DatePicker
                  selected={startDate}
                  isClearable
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  onChange={(date: Date) => setStartDate(date)}
                />
              </Col>
              <Col className="form-col">
                <FormLabel>
                  <span>End Date </span>
                  <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="bottom"
                    overlay={endDatePopover}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </OverlayTrigger>
                </FormLabel>{" "}
                <DatePicker
                  selected={endDate}
                  isClearable
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  onChange={(date: Date) => setEndDate(date)}
                />
              </Col>
              <Col className="form-col">
                <FormLabel>
                  <span>Call Status </span>
                  <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="bottom"
                    overlay={statusPopover}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </OverlayTrigger>{" "}
                </FormLabel>
                <Form.Control
                  as="select"
                  placeholder="Call Status"
                  ref={statusRef}
                >
                    <option>CLOSED</option>
                    <option>ACTIVE</option>
                </Form.Control>
              </Col>
              <Col className="form-search-col">
                <Button variant="primary" onClick={() => onSearch()}>
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <Loading show={loading} />
        </Col>
      </Row>
      <Row className="history-search-row">
        <Col>
          <div>
            <MeetingDetailsTable items={items} />
          </div>
        </Col>
      </Row>
      <Row xs={1} md={3} lg={3} className="history-search-row">
        <Col className="previous-page">
          {prevTokens.length > 0 && (
            <Button variant="primary" onClick={() => onPreviousPage()}>
              Previous
            </Button>
          )}
        </Col>
        <Col>{pageNumber > 0 && <span>Page {pageNumber}</span>}</Col>
        <Col className="next-page">
          {nextToken && (
            <Button variant="primary" onClick={() => onNextPage()}>
              Next
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CallHistory;

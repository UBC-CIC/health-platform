import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Container,
  Modal,
  Table,
  Row,
} from "react-bootstrap";
import { faUser, faUserTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Attendee, AttendeeState } from "../../common/types/API";
import "./Attendees.css";

export const Attendees = (props: {
  attendeeList: (Attendee | null)[];
  handleKick: (attendeeId?: string | null) => void;
}) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="light" onClick={handleShow}>
        <FontAwesomeIcon icon={faUser} />{" "}
        <Badge pill variant="dark">
          {
            props.attendeeList?.filter(
              (a) => a?.attendee_state === AttendeeState.IN_CALL
            ).length
          }
        </Badge>
      </Button>

      <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
        <Modal.Header closeButton>
          <Modal.Title>Attendees List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Phone Number</th>
                <th>Name</th>
                <th>Organization</th>
                <th>Role</th>
                <th>Connected Via</th>
                <th>Remove User</th>
              </tr>
            </thead>
            <tbody>
              {props.attendeeList &&
                props.attendeeList.map((attendee: Attendee | null) => (
                  <tr key={attendee?.attendee_id}>
                    <td>{attendee?.phone_number}</td>
                    <td>
                      {attendee?.first_name} {attendee?.last_name}
                    </td>
                    <td>{attendee?.organization}</td>
                    <td>{attendee?.user_role}</td>
                    <td>{attendee?.attendee_join_type}</td>
                    <td className="kick">
                      {attendee?.attendee_state === AttendeeState.KICKED ? (
                        <Badge pill variant="danger">
                          Removed
                        </Badge>
                      ) : (
                        <Button
                          variant="danger"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!attendee) return;
                            props.handleKick(attendee?.attendee_id);
                          }}
                        >
                          <FontAwesomeIcon icon={faUserTimes} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Attendees;

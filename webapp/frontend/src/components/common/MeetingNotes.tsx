import React, { useState } from 'react'
import { Alert, Button, Modal } from 'react-bootstrap';
import { faClipboard, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MeetingDetail, SpecialistProfile } from '../../common/types/API';
import { getMeetingDetail, getSpecialistProfilesByStatus } from '../../common/graphql/queries';
import { SpecialistsTable } from '../common/SpecialistsTable';
import './Specialists.css';
import { API } from 'aws-amplify';
import { updateMeetingDetail } from '../../common/graphql/mutations';

export const MeetingNotes = (props: { meetingDetail: MeetingDetail }) => {
    const [comments, updateComments] = useState<string>(props.meetingDetail.meeting_comments ? props.meetingDetail.meeting_comments : "Click to edit meeting notes")

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);

    const openMeetingDetails = async () => {
        setShow(true);
    };

    const onCommentsChange = async (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        const updatedComments = event.target.innerText;
        updateComments(updatedComments);
    };

    const saveMeetingComments = async () => {
        const latestMeetingDetail: any = await API.graphql({
            query: getMeetingDetail,
            variables: {
                meetingId: props.meetingDetail.meeting_id
            }
        });
        const detail: MeetingDetail = latestMeetingDetail["data"]["getMeetingDetail"];
        detail.meeting_comments = comments;

        try {
            const data: any = await API.graphql({
                query: updateMeetingDetail,
                variables: { input: detail },
            });
            setShow(false);
        } catch (e) {
            console.log("Mutation returned error", e);
        }
    };

    return (
        <>
            <Button variant="light" onClick={openMeetingDetails} title="Meeting Notes">
                <FontAwesomeIcon icon={faClipboard} />
                {"  "}
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                dialogClassName="modal-90w"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Meeting Notes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div contentEditable suppressContentEditableWarning onBlur={(e) => onCommentsChange(e)} style={{whiteSpace: "pre"}}>
                        {comments}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={saveMeetingComments}>
                        Save
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}


export default MeetingNotes;
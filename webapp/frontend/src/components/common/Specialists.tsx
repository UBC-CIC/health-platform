import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SpecialistProfile } from '../../common/types/API';
import { getSpecialistProfilesByStatus } from '../../common/graphql/queries';
import { SpecialistsTable } from '../common/SpecialistsTable';
import './Specialists.css';
import { API } from 'aws-amplify';

export const Specialists = (props: { status: String, external_meeting_id?: string | null, disabled?: boolean | null }) => {
    const [items, updateItems] = useState<Array<SpecialistProfile>>(new Array<SpecialistProfile>())

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);

    const onGetAvailableSpecialists = async () => {
        try {
            const userStatus = props.status;

            const specialists: any = await API.graphql({
                query: getSpecialistProfilesByStatus,
                variables: {
                    userStatus: userStatus
                }
            });
            console.log('getSpecialistProfilesByStatus specialists:', specialists);

            const itemsReturned: Array<SpecialistProfile> = specialists['data']['getSpecialistProfilesByStatus']['items'];
            console.log('getMeetingDetailsByStatus meetings:', itemsReturned);
            updateItems(itemsReturned);

            setShow(true);

        } catch (e) {
            console.log('getMeetingDetailsByStatusAndCreateTime errors:', e.errors);
        }
    };

    return (
        <>
            {props.disabled ? (
                <Button variant="info" onClick={onGetAvailableSpecialists} title="Add Specialists" disabled>
                    <FontAwesomeIcon icon={faUserPlus} />
                </Button>
            ) : (
                <Button variant="info" onClick={onGetAvailableSpecialists} title="Add Specialists">
                    <FontAwesomeIcon icon={faUserPlus} />
                </Button>
            )}

            <Modal
                show={show}
                onHide={handleClose}
                dialogClassName="modal-90w"
            >
                <Modal.Header closeButton>
                    <Modal.Title> {"Specialists - "}{props.status} </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SpecialistsTable items={items} external_meeting_id={props.external_meeting_id} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}


export default Specialists;
import { Button, Table } from 'react-bootstrap';
import { faPhoneSquareAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SpecialistProfile, GeolocationCoordinates, SpecialistCallStatus, SpecialistStatus } from '../../common/types/API';
import './Specialists.css';
import { notifySpecialist } from "../../common/graphql/mutations";
import reverse from "reverse-geocode";
import API from '@aws-amplify/api';
export const SpecialistsTable = (props: { items: Array<SpecialistProfile>, external_meeting_id?:string | null }) => {


    const handlePage = async (specialist?: SpecialistProfile | null, external_meeting_id?:string | null) => {
        if (!specialist || !external_meeting_id) {
            console.error("No Phone number or external meeting id");
            return;
        }
        let res = await API.graphql({
            query: notifySpecialist,
            variables: {
              input: {
                external_meeting_id,
                specialist,
              },
            },
          });
        console.log(res);
        
        specialist.call_status = SpecialistCallStatus.PAGED;
    }

    const getLocation = (location?: GeolocationCoordinates) => {
        if (!location?.latitude || !location?.longitude) return "Unknown Location";
        const {latitude, longitude} = location;
        return reverse.lookup(latitude, longitude, "ca").region;
    }

    return (
        <div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Phone Number</th>
                        <th>Name</th>
                        <th>Organization</th>
                        <th>Role</th>
                        <th className="email">Email</th>
                        <th>Location</th>
                        <th>Notes</th>
                        <th>Status</th>
                        <th>Page</th>
                    </tr>
                </thead>
                <tbody>
                    {props.items && props.items.map((specialist: SpecialistProfile | null) => (
                        <tr key={specialist?.phone_number}>
                            <td>
                                {specialist?.phone_number}
                            </td>
                            <td>
                                {specialist?.first_name}{' '}{specialist?.last_name}
                            </td>
                            <td>
                                {specialist?.organization}
                            </td>
                            <td>
                                {specialist?.user_role}
                            </td>
                            <td className="email">
                                {specialist?.email}
                            </td>
                            <td className="email">
                                {getLocation(specialist?.location)}
                            </td>
                            <td>
                                {specialist?.notes}
                            </td>
                            <td>
                                {specialist?.call_status === SpecialistCallStatus.IN_CALL && "In Call"}
                                {specialist?.call_status === SpecialistCallStatus.NOT_IN_CALL && specialist?.user_status === SpecialistStatus.AVAILABLE && "Available"}
                                {specialist?.call_status === SpecialistCallStatus.NOT_IN_CALL && specialist?.user_status !== SpecialistStatus.AVAILABLE && "Not Available"}
                                {specialist?.call_status === SpecialistCallStatus.PAGED && "Paged"}
                            </td>
                            <td>
                                <Button variant="light" onClick={() => handlePage(specialist, props.external_meeting_id)}>
                                    <FontAwesomeIcon icon={faPhoneSquareAlt} size="2x" color="#28a745" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )
}


export default SpecialistsTable;
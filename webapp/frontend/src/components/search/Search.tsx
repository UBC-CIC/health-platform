import { API } from 'aws-amplify';
import { useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { getSpecialistProfilesByStatus } from '../../common/graphql/queries';
import { SpecialistProfile, SpecialistStatus } from '../../common/types/API';
import { SpecialistsTable } from '../common/SpecialistsTable';

import './search.css';

export const Search = () => {
    const [items, updateItems] = useState<Array<SpecialistProfile>>(new Array<SpecialistProfile>())
    const statusRef = useRef<HTMLSelectElement>(null);

    const onGetAvailableSpecialists = async () => {
        try {
            const userStatus = statusRef.current ? statusRef.current.value : SpecialistStatus.AVAILABLE;

            console.log('getSpecialistProfilesByStatus status:', userStatus);

            const specialists: any = await API.graphql({
                query: getSpecialistProfilesByStatus,
                variables: {
                    userStatus: userStatus
                }
            });
            console.log('getSpecialistProfilesByStatus specialists:', specialists);

            const itemsReturned: Array<SpecialistProfile> = specialists['data']['getSpecialistProfilesByStatus']['items'];
            console.log('getSpecialistProfilesByStatus meetings:', itemsReturned);
            updateItems(itemsReturned);

        } catch (e) {
            console.log('getSpecialistProfilesByStatus errors:', e.errors);
        }
    };

    return (
        <Container fluid >
            <Row className="specialists-search-row">
                <Col>
                <Form onSubmit={() => onGetAvailableSpecialists()}>
                    <Row xs={1} md={4} lg={4}>
                        <Col>
                            <Form.Control 
                              as="select" 
                              placeholder="Specialist Status" 
                              ref={statusRef}>
                                <option>{SpecialistStatus.AVAILABLE}</option>
                                <option>{SpecialistStatus.NOT_AVAILABLE}</option>
                                <option>{SpecialistStatus.OFFLINE}</option>
                                <option>ALL</option>
                            </Form.Control>
                        </Col>
                        <Col>
                            <Button variant="primary"
                                onClick={() => onGetAvailableSpecialists()}>
                                Search
                            </Button>
                        </Col>
                    </Row>
                </Form>
                </Col>
            </Row>
            <Row className="specialists-search-row">
                <Col>
                    <div>
                        <SpecialistsTable items={items} />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Search;
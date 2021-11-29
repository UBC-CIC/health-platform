import { API } from 'aws-amplify';
import { useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import './search.css';

export const Search = () => {
    return (
        <Container fluid >
            <Row className="specialists-search-row">
                <Col>
                <Form>
                    <Row xs={1} md={4} lg={4}>
                        <Col>
                        </Col>
                        <Col>
                            <Button variant="primary">
                                Search
                            </Button>
                        </Col>
                    </Row>
                </Form>
                </Col>
            </Row>
            <Row className="specialists-search-row">
                <Col>
                </Col>
            </Row>
        </Container>
    );
};

export default Search;
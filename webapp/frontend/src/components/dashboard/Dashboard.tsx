import React, { useEffect, useRef, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import { API } from 'aws-amplify';
import { getMeetingDetailsByStatus } from '../../common/graphql/queries';
import MeetingDetailsTable from '../common/MeetingDetailsTable';
import { MeetingDetail } from '../../common/types/API';
import { onCreateMeetingDetail, onUpdateMeetingDetail } from '../../common/graphql/subscriptions';

export const Dashboard = () => {
    const [items, updateItems] = useState<Array<MeetingDetail>>(new Array<MeetingDetail>());
    const stateRef = useRef<Array<MeetingDetail>>();
    stateRef.current = items;

    useEffect(() => {

        async function subscribeCreateMeetings() {
            const subscription:any = API.graphql({
                query: onCreateMeetingDetail
            });

            subscription.subscribe({
                next: (data:any) => {
                    console.log("data received from create subscription:", data);
                    const newItems = [];
                    let found = false;
                    if (data.value.data) {
                        for (let item of stateRef.current!) {
                            if (data.value.data.onCreateMeetingDetail.meeting_id === item.meeting_id) {
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
                        updateItems(newItems);
                    }
                },
                error: (error:any) => console.warn(error)
            });
        };

        async function subscribeUpdateMeetings() {
            const subscription:any = API.graphql({
                query: onUpdateMeetingDetail
            });

            subscription.subscribe({
                next: (data:any) => {
                    const newItems = [];
                    if (data.value.data.onUpdateMeetingDetail) {
                        for (let item of stateRef.current!) {
                            if (data.value.data.onUpdateMeetingDetail.meeting_id === item.meeting_id) {
                                // Found existing item so we will update this item
                                newItems.push(data.value.data.onUpdateMeetingDetail);
                            } else {
                                // Keep existing item
                                newItems.push(item);
                            }
                        }
                        updateItems(newItems);
                    }
                },
                error: (error:any) => console.warn(error)
            });
        };

        async function callListAllMeetings() {
            try {
                const meetings: any = await API.graphql({
                    query: getMeetingDetailsByStatus,
                    variables: {
                        meetingStatus: "ACTIVE",
                        limit: 25
                    }
                });
                console.log(meetings);
                
                const itemsReturned: Array<MeetingDetail> = meetings['data']['getMeetingDetailsByStatus']['items'];
                console.log('getMeetingDetailsByStatus meetings:', itemsReturned);
                updateItems(itemsReturned);
            } catch (e) {
                console.log('getMeetingDetailsByStatus errors:', e  );
            }
        }

        callListAllMeetings()
        subscribeCreateMeetings()
        subscribeUpdateMeetings()
    }, []);


    return (
        <Container fluid >
            <Row>
                <Col>
                    <div>
                        <MeetingDetailsTable items={items}/>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

export default Dashboard;
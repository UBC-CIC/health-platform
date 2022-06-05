import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Toolbar from "@mui/material/Toolbar";
import { API } from "aws-amplify";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { getEventDetailsByUser, getEventDetailsByUserAndCreateTime, searchEvents } from "../../common/graphql/queries";
import { onCreateEventDetail } from "../../common/graphql/subscriptions";
import { EventDetail, PatientsDetail, SearchRequest, UsersDetail } from "../../common/types/API";
import { getAbsoluteTimeFromRelativeTime, subtractHours } from "../../utils/time";
import queryString from 'query-string';

import "./events.css";
import { Sidebar } from "./Sidebar";
import { Link, useHistory, useLocation } from "react-router-dom";
import EventCreate from "./EventCreate";
import { Button } from "@mui/material";

function createData(
    name: string,
    start: number,
    finish: number,
    mood: string,
    medication: string
) {
    return { name, start, finish, mood, medication };
}

const rows = [
    createData("Episode 1", 159, 6.0, "Happy", "None"),
    createData("Episode 2", 237, 9.0, "Happy", "None"),
    createData("Episode 3", 262, 16.0, "Happy", "None"),
];

const DEFAULT_HOURS_AGO = 12;
const LINK_TO_DASHBOARD_START_BUFFER_MILLISEC = 60 * 60 * 1000;
const LINK_TO_DASHBOARD_END_BUFFER_MILLISEC = 10 * 60 * 1000;

export const Events = (props: {
    userName: any,
    userId: any,
    userDetail: UsersDetail,
    patients: PatientsDetail[],
}) => {
    const history = useHistory();
    const location = useLocation();
    const queryModel = queryString.parse(location.search);

    const [searchProperties, setSearchProperties] = React.useState<any>({
        // @ts-ignore
        start: queryModel["start"] ? new Date(parseInt(queryModel["start"])) : subtractHours(new Date(), DEFAULT_HOURS_AGO),
        // @ts-ignore
        end: queryModel["end"] ? new Date(parseInt(queryModel["end"])) : new Date(),
        startRelative: queryModel["startRelative"] ? queryModel["startRelative"] : `${DEFAULT_HOURS_AGO}h`,
        endRelative: queryModel["endRelative"] ? queryModel["endRelative"] : "0h",
        type: queryModel["type"] ? queryModel["type"] : "relative",
        period: queryModel["period"] ? queryModel["period"] : '5m',
        statistic: queryModel["statistic"] ? queryModel["statistic"] : "avg",
        patient: queryModel["patient"] ? queryModel["patient"] : "all",
        keyword: queryModel["keyword"] ? queryModel["keyword"] : "",
    });

    const [isLoading, setIsLoading] = useState<any>(false);

    const [items, updateItems] = useState<Array<EventDetail>>(new Array<EventDetail>());
    const stateRef = useRef<Array<EventDetail>>();
    stateRef.current = items;


    async function search() {

        // Update the time (in case we are using relative times) before handling the update
        //
        let start = searchProperties.start;
        let end = searchProperties.end;
        setIsLoading(true);
        if (searchProperties.type === "relative") {
            start = getAbsoluteTimeFromRelativeTime(searchProperties.startRelative);
            end = getAbsoluteTimeFromRelativeTime(searchProperties.endRelative);
            setSearchProperties({
                ...searchProperties,
                start: start,
                end: end,
            });
        }

        history.push(`/events?start=${start.getTime()}&end=${end.getTime()}&keyword=${searchProperties.keyword}&startRelative=${searchProperties.startRelative}&endRelative=${searchProperties.endRelative}&type=${searchProperties.type}&period=${searchProperties.period}&statistic=${searchProperties.statistic}&patient=${searchProperties.patient}&showOverlay=${searchProperties.showOverlay}&useLocalTimezone=${searchProperties.useLocalTimezone}`);

        let items = [];

        if (searchProperties.keyword !== "") {
            // Elastic Search version (when keyword search is not needed)
            //
            const searchRequest: SearchRequest = {
                keyword: searchProperties.keyword,
                start: start,
                end: end,
                patient_name: searchProperties.patient
            };
            console.log("searchRequest:", searchRequest);

            try {
                const request = {
                    query: searchEvents,
                    variables: { input: searchRequest },
                };
                const response: any = await API.graphql(request);
                items = response["data"]["searchEvents"]["events"].map((event: any) => {
                    return event as EventDetail;
                });
                console.log("searchEvents response:", response);
            } catch (e) {
                console.log("searchEvents errors:", e);
            }
        } else {
            // DynamoDB version (when keyword search is not needed)
            //
            const patientIds = searchProperties.patient === "all" ? props.userDetail.patient_ids : [searchProperties.patient];
            console.log("patientIds: ")
            console.log(patientIds)
            if (patientIds) {
                for (const patientId of patientIds) {
                    console.log("looking for patient ", patientId, start.toISOString(), end.toISOString())
                    const events: any = await API.graphql({
                        query: getEventDetailsByUserAndCreateTime,
                        variables: {
                            userId: patientId,
                            startTime: start.toISOString(),
                            endTime: end.toISOString(),
                            limit: 100,
                        }
                    });

                    const itemsReturned: Array<EventDetail> = events['data']['getEventDetailsByUserAndCreateTime']['items'];
                    for (var event of itemsReturned) {
                        items.push(event);
                    }
                }
            }
        }

        console.log("found items: ", items.length)
        updateItems(items);
        setIsLoading(false);
    }

    async function subscribeCreateEvents() {
        const subscription: any = API.graphql({
            query: onCreateEventDetail
        });

        subscription.subscribe({
            next: (data: any) => {
                console.log("data received from create subscription:", data);
                const newItems = [];
                let found = false;
                if (data.value.data) {
                    for (let item of stateRef.current!) {
                        if (data.value.data.onCreateEventDetail.userId === item.user_id) {
                            // Found existing item so we will update this item
                            newItems.push(data.value.data.onCreateEventDetail);
                            found = true;
                        } else {
                            // Keep existing item
                            newItems.push(item);
                        }
                    }
                    if (!found) {
                        newItems.push(data.value.data.onCreateEventDetail);
                    }
                    updateItems(newItems);
                }
            },
            error: (error: any) => console.warn(error)
        });
    };


    // async function subscribeUpdateMeetings() {
    //     const subscription:any = API.graphql({
    //         query: onUpdateMeetingDetail
    //     });

    //     subscription.subscribe({
    //         next: (data:any) => {
    //             const newItems = [];
    //             if (data.value.data.onUpdateMeetingDetail) {
    //                 for (let item of stateRef.current!) {
    //                     if (data.value.data.onUpdateMeetingDetail.meeting_id === item.meeting_id) {
    //                         // Found existing item so we will update this item
    //                         newItems.push(data.value.data.onUpdateMeetingDetail);
    //                     } else {
    //                         // Keep existing item
    //                         newItems.push(item);
    //                     }
    //                 }
    //                 updateItems(newItems);
    //             }
    //         },
    //         error: (error:any) => console.warn(error)
    //     });
    // };

    useEffect(() => {
        if (Object.keys(props.userDetail).length > 0 && props.patients.length > 0) {
            search()
            // subscribeCreateEvents()
            // subscribeUpdateMeetings()
        }
    }, []);

    function getPatientName(patientId: string) {
        let patientName = "";
        for (const p of props.patients) {
            if (p.patient_id === patientId) {
                patientName = p.name!;
            }
        }
        return patientName;
    }

    function getLinkToDashboardLink(eventStart: string, eventEnd: string, patientId: string) {
        const start = new Date(eventStart).getTime() - LINK_TO_DASHBOARD_START_BUFFER_MILLISEC
        const end = new Date(eventEnd).getTime() + LINK_TO_DASHBOARD_END_BUFFER_MILLISEC
        return `/dashboard?start=${start}&end=${end}&type=absolute&patient=${patientId}`
    }

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            <Sidebar
                searchProperties={searchProperties}
                setSearchProperties={setSearchProperties}
                isLoading={isLoading}
                search={search}
                patients={props.patients}
            />

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Box
                    m={1}
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="flex-end"
                >
                    <EventCreate
                        patients={props.patients} 
                        userName={props.userName}
                        disabled="true"
                    />
                </Box>

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="caption table">
                        {
                            items.length == 0 && <caption>No events found - try expanding the search range.</caption>
                        }
                        <TableHead>
                            <TableRow>
                                <TableCell>Start</TableCell>
                                <TableCell>Finish</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Food</TableCell>
                                <TableCell>Mood</TableCell>
                                <TableCell>Medication</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((row) => (
                                <TableRow key={row.event_id}>
                                    <TableCell component="th" scope="row">
                                        {row.start_date_time}
                                    </TableCell>
                                    <TableCell>{row.end_date_time}</TableCell>
                                    <TableCell>{getPatientName(row.user_id!)}</TableCell>
                                    <TableCell>{row.food}</TableCell>
                                    <TableCell>{row.mood}</TableCell>
                                    <TableCell>{row.medication}</TableCell>
                                    <TableCell>{row.notes}</TableCell>
                                    <TableCell>
                                        <Link to={getLinkToDashboardLink(row.start_date_time!, row.end_date_time!, row.user_id!)} style={{textDecoration: "none"}}>
                                            <Button variant={"outlined"} color={"primary"} size={"small"}>
                                                Show on Dashboard
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default Events;

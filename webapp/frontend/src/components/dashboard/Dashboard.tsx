import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {
    CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, 
    TimeScale,
    TimeSeriesScale,
    Tooltip,
    ChartDataset
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import React, { useContext, useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2';
import './dashboard.css';
import { Sidebar } from './Sidebar';
import moment from 'moment';
import { EventTimelineChart, Phase } from './EventTimelineChart';
import { getEventDetailsByUser, query } from '../../common/graphql/queries';
import { API, Auth } from 'aws-amplify';
import { CircularProgress, Grid, LinearProgress } from '@mui/material';
import { ThemeColor } from './types';
import EventCreate from '../events/EventCreate';
import { getAbsoluteTimeFromRelativeTime, subtractHours } from '../../utils/time';
import { EventDetail } from '../../common/types/API';
import { differenceInSeconds } from 'date-fns';
import TimelineChart from './TimelineChart';



const faker = require('faker');

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    TimeScale,
    TimeSeriesScale,
    Legend,
    annotationPlugin
);

const DEFAULT_HOURS_AGO = 6;

export const Dashboard = (props: { userName: any}) => {
    
    const [searchProperties, setSearchProperties] = React.useState<any>({
        start: new Date(),
        end: subtractHours(new Date(), DEFAULT_HOURS_AGO),
        startRelative: `${DEFAULT_HOURS_AGO}h`,
        endRelative: "0h",
        type: "relative",
        period: "5m",
        statistic: "avg",
        showOverlay: true,
    });

    const [isLoading, setIsLoading] = useState<any>(false);

    const [eventsStart, setEventsStart] = useState<any>(subtractHours(new Date(), DEFAULT_HOURS_AGO));
    const [eventsEnd, setEventsEnd] = useState<any>(new Date());
    const [eventsData, setEventsData] = useState<any>({
        labels: [],
        datasets: [],
    });

    const [hrData, setHrData] = useState<any>({
        labels: [],
        datasets: [],
    });

    const [rrData, setRrData] = useState<any>({
        labels: [moment.unix(1578030195), moment.unix(1580708595), moment.unix(1583214195), moment.unix(1585892595), moment.unix(1588484595)],
        datasets: [
            {
                label: 'Dataset 1',
                data: [moment.unix(1578030195), moment.unix(1580708595), moment.unix(1583214195), moment.unix(1585892595), moment.unix(1588484595)].map(() => faker.datatype.number({ min: -1000, max: 1000 })),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    });

    useEffect(() => {
        async function callQueryRequest() {
            try {
                update();
            } catch (e) {
                console.log('callQueryRequest errors:', e);
            }
        }
    
        callQueryRequest()
        callListAllEvents()
    }, []);


    async function callListAllEvents() {
        try {
            const events: any = await API.graphql({
                query: getEventDetailsByUser,
                variables: {
                    userId: props.userName,
                    limit: 100,
                }
            });
            console.log("callListAllEvents");
            console.log(events);

            // const PHASES: Phase[] = [
            //     {
            //         name: "",
            //         startDate: "2021-02-15",
            //         endDate: "2021-03-16"
            //     }
            // ];

            // {{
            //     datasets: phasesToDatesets(PHASES, refDate),
            //     labels: phasesToLabels(PHASES)
            // }}

            const itemsReturned: Array<EventDetail> = events['data']['getEventDetailsByUser']['items'];

            const labels: any[] = [];
            const phases: any[] = [];
            let previousDate = searchProperties.start;
            for (var event of itemsReturned) {
                labels.push(event.medication!);
                phases.push(
                    {
                        backgroundColor: ThemeColor.Transparent,
                        data: [differenceInSeconds(previousDate, new Date(event.start_date_time!))]
                    }
                );
                phases.push(
                    {
                        backgroundColor: ThemeColor.Primary,
                        hoverBackgroundColor: ThemeColor.Secondary,
                        data: [differenceInSeconds(new Date(event.start_date_time!), new Date(event.end_date_time!))]
                    }
                );
                previousDate = event.end_date_time;
            }
            // const phases = itemsReturned.map(event => {
            //     // return {
            //     //     name: "Test",
            //     //     startDate: event.start_date_time!,
            //     //     endDate: event.end_date_time!,
            //     //     medication: event.medication!,
            //     //     mood: event.mood!,
            //     //     food: event.food!,
            //     //     notes: event.notes!,
            //     // }
            // });

            console.log('PHASES:', phases);
            setEventsData({
                // labels: phases.map((phase) => phase.name),
                labels: labels,
                // datasets: phasesToDatasets(phases, searchProperties.start)
                datasets: phases
            });
        } catch (e) {
            console.log('getEventDetailsByUser errors:', e );
        }
    }

    const phasesToDatasets = (phases: Phase[], refDate: Date) =>
    [
        {
            backgroundColor: ThemeColor.Transparent,
            data: phases.map((phase) => {
                console.log("PHASE " + refDate);
                return differenceInSeconds(refDate, new Date(phase.startDate));
            })
        },
        {
            backgroundColor: ThemeColor.Primary,
            hoverBackgroundColor: ThemeColor.Secondary,
            minBarLength: 5,
            data: phases.map((phase) =>
                differenceInSeconds(new Date(phase.startDate), new Date(phase.endDate))
            )
        },
        // {
        //     backgroundColor: ThemeColor.Transparent,
        //     hoverBackgroundColor: ThemeColor.Transparent,
        //     data: phases.map((phase) =>
        //         240000
        //     )
        // },
        // {
        //     backgroundColor: ThemeColor.Primary,
        //     hoverBackgroundColor: ThemeColor.Secondary,
        //     minBarLength: 5,
        //     data: phases.map((phase) =>
        //         3600*3
        //     )
        // },
    ] as ChartDataset<"bar">[];

    async function update() {
        // Update the time (in case we are using relative times) before handling the update
        //
        let start = searchProperties.start;
        let end = searchProperties.end;
        setEventsStart(start);
        setEventsEnd(end);
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

        callListAllEvents();

        // Run the update logic
        //
        const input = {
            "patient_id": "", // TODO
            "period": searchProperties.period,
            "statistic": searchProperties.statistic,
            "start": start,
            "end": end,
        };
        console.log(`callQueryRequest request with ${JSON.stringify(input)}`);
    
        const response: any = await API.graphql({
            query: query,
            variables: {
                input: input
            }
        });
        console.log('callQueryRequest response', response);

        const columns = response["data"]["query"]["columns"];
        let rows = response["data"]["query"]["rows"];
        setIsLoading(false);

        const columnToIndex = new Map<string, number>();
        const measureNameToVals = new Map<string, number[]>();
        const measureNameToTimestamps = new Map<string, moment.Moment[]>();
        
        columns.forEach((item: string, index: number) => {
            columnToIndex.set(item, index);
        });

        rows.forEach((row: string[], index: number) => {
            // Timestream does not have timezone support
            const t = row[columnToIndex.get("binned_timestamp")!]
            const timestamp = moment(`${t}Z`);
            const measureName = row[columnToIndex.get("measure_name")!]
            const val = row[columnToIndex.get("measure_val")!]
            if (!measureNameToVals.has(measureName)) {
                measureNameToVals.set(measureName, []);
                measureNameToTimestamps.set(measureName, []);
            }
            if (val !== "" && Number(val)) {
                measureNameToVals.get(measureName)!.push(+val);
                measureNameToTimestamps.get(measureName)!.push(timestamp);
            }
        });

        let datasets = [];
        if (rows.length > 0) {
            const randomMeasure = measureNameToVals.keys().next().value;
            datasets.push({
                label: randomMeasure,
                data: measureNameToVals.get(randomMeasure),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            });

            setHrData({
                labels: measureNameToTimestamps.get(randomMeasure),
                datasets: datasets,
            });
        } else {
            setHrData({
                labels: [],
                datasets: [],
            });
        }
        return false;
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
            autocolors: false,
            annotation: {
                annotations: {
                    box1: {
                        // Indicates the type of annotation
                        type: 'box' as const,
                        xMin: 1,
                        xMax: 2,
                        yMin: -1000,
                        yMax: 1000,
                        backgroundColor: 'rgba(255, 99, 132, 0.25)'
                    }
                }
            }
        },
    };

    const optionsHr = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
            autocolors: false,
        },
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <Sidebar 
                searchProperties={searchProperties}
                setSearchProperties={setSearchProperties}
                isLoading={isLoading}
                update={update}
                userName={props.userName}
            />

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Box sx={{ mb: 3 }}>
                    <Card sx={{ minWidth: 275 }}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Typography variant="h6" gutterBottom component="div">
                                    Event Timeline
                                </Typography>
                                <EventCreate userName={props.userName} disabled="true" />
                            </Box>

                            <EventTimelineChart
                                startDate={eventsStart}
                                endDate={eventsEnd}
                                data={eventsData}
                            />
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ mb: 3 }}>
                    <Card sx={{ minWidth: 275 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom component="div">
                                Heart Rate
                            </Typography>
                            {isLoading &&
                                <Box
                                    style={{ height: '120px', margin: 'auto', textAlign: 'center', paddingTop: '36px', color: ThemeColor.MediumContrast }}
                                >
                                    <CircularProgress size={12} color='inherit' />{' '}Loading...
                                </Box>
                            }
                            {!isLoading && hrData.datasets.length > 0 &&
                                <Line
                                    height={"60px"}
                                    options={optionsHr}
                                    data={hrData}
                                />
                            }
                            {!isLoading && hrData.datasets.length == 0 &&
                                <Box
                                    style={{ height: '120px', margin: 'auto', textAlign: 'center', paddingTop: '36px', color: ThemeColor.MediumContrast }}
                                >
                                    No Data Found
                                </Box>
                            }
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ mb: 3 }}>
                    <Card sx={{ minWidth: 275 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom component="div">
                                Respiratory Rate
                            </Typography>
                            <Line
                                height={"60px"}
                                options={options}
                                data={rrData}
                            />
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard;
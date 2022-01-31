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
    Tooltip
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import React, { useContext, useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2';
import './dashboard.css';
import { Sidebar } from './Sidebar';
import moment from 'moment';
import { EventTimelineChart } from './EventTimelineChart';
import { query } from '../../common/graphql/queries';
import { API, Auth } from 'aws-amplify';
import { CircularProgress, Grid, LinearProgress } from '@mui/material';
import { ThemeColor } from './types';
import EventCreate from '../events/EventCreate';
import { getAbsoluteTimeFromRelativeTime, subtractHours } from '../../utils/time';



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

export const Dashboard = (props: { userName: any}) => {
    
    const [searchProperties, setSearchProperties] = React.useState<any>({
        start: new Date(),
        end: subtractHours(new Date(), 2),
        startRelative: "0h",
        endRelative: "3h",
        type: "relative",
        period: "5m",
        statistic: "avg",
        showOverlay: true,
    });

    const [isLoading, setIsLoading] = useState<any>(false);

    const [hrData, setHrData] = useState<any>({
        labels: [],
        datasets: [],
    });

    const user = "placeholder";

    useEffect(() => {
        async function callQueryRequest() {
            try {
                update();
            } catch (e) {
                console.log('callQueryRequest errors:', e);
            }
        }
    
        callQueryRequest()
    }, [user]);

    // TODO: MAKE CHART A PURE CHILD COMPONENT TO AVOID RERENDERING
    // https://stackoverflow.com/questions/62036973/avoid-component-update-while-changing-state-vaiable
    async function update() {
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

    const data = {
        labels: [moment.unix(1578030195), moment.unix(1580708595), moment.unix(1583214195), moment.unix(1585892595), moment.unix(1588484595)],
        datasets: [
            {
                label: 'Dataset 1',
                data: [moment.unix(1578030195), moment.unix(1580708595), moment.unix(1583214195), moment.unix(1585892595), moment.unix(1588484595)].map(() => faker.datatype.number({ min: -1000, max: 1000 })),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Dataset 2',
                data: [moment.unix(1578030195), moment.unix(1580708595), moment.unix(1583214195), moment.unix(1585892595), moment.unix(1588484595)].map(() => faker.datatype.number({ min: -1000, max: 1000 })),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
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

                            {searchProperties.start &&
                                <EventTimelineChart
                                    startDate={searchProperties.start}
                                    endDate={searchProperties.end}
                                />
                            }
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
                                data={data}
                            />
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard;
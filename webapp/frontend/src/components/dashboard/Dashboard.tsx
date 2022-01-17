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
import { UserContext } from '../../context/UserContext';



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

export const Dashboard = () => {
    
    const [timeBoundaries, setTimeBoundaries] = React.useState<any>({
        start: "2021-08-18T21:11:54Z",
        end: "2021-10-18T21:11:54Z",
    });

    const [hrData, setHrData] = useState<any>({
        labels: [],
        datasets: [],
    });

    const user = "placeholder";

    useEffect(() => {
        async function callQueryRequest() {
            try {
                console.log('callQueryRequest request');
    
                const response: any = await API.graphql({
                    query: query,
                    variables: {limit: 100}
                });
                console.log('callQueryRequest response', response);

                const hrs = response["data"]["query"]["heartrate"];
                let timestamps = response["data"]["query"]["timestamp"];
                timestamps = timestamps.map((t: number) => {
                    return moment.unix(t)
                });

                const datasets = [{
                    label: 'Dataset 1',
                    data: hrs,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }];

                // setHrData({
                //     labels: timestamps,
                //     datasets: datasets,
                // });
            } catch (e) {
                console.log('callQueryRequest errors:', e);
            }
        }
    
        callQueryRequest()
    }, [user]);

    function newDate(days: any) {
        return moment().add(days, 'd').toDate();
    }

    function newDateString(days: any) {
        return moment().add(days, 'd').format();
    }

    function randomScalingFactor() {
        return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
    };

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
                timeBoundaries={timeBoundaries}
                setTimeBoundaries={setTimeBoundaries}
            />

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Box sx={{ mb: 3 }}>
                    <Card sx={{ minWidth: 275 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom component="div">
                                Event Timeline
                            </Typography>
                            {timeBoundaries.start &&
                                <EventTimelineChart
                                    startDate={timeBoundaries.start}
                                    endDate={timeBoundaries.end}
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
                            <Line
                                height={"60px"}
                                options={optionsHr}
                                data={hrData}
                            />
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
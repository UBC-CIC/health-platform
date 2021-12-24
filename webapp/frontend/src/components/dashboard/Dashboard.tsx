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
import React from 'react';
import { Line } from 'react-chartjs-2';
import './dashboard.css';
import { Sidebar } from './Sidebar';
import moment from 'moment';
import { PhaseChart } from './EventTimelineChart';



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

function newDate(days: any) {
    return moment().add(days, 'd').toDate();
}

function newDateString(days: any) {
    return moment().add(days, 'd').format();
}

function randomScalingFactor() {
	return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
};

export const options = {
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


export const optionsTimeline: any = {
    responsive: true,
    title:{
        display:true,
        text:"Chart.js Time Point Data"
    },
    scales: {
        x: {
            type: "time",
            display: true,
            scaleLabel: {
                display: true,
                labelString: 'Date'
            }
        },
        y: {
            display: true,
            scaleLabel: {
                display: true,
                labelString: 'value'
            }
        }
    }
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
    labels,
    datasets: [
        {
            label: 'Dataset 1',
            data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
            label: 'Dataset 2',
            data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
    ],
};

export const dataTimeline: any = {
    datasets: [{
        label: "Dataset with string point data",
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        fill: false,
        data: [{
            x: newDateString(0),
            y: randomScalingFactor()
        }, {
            x: newDateString(2),
            y: randomScalingFactor()
        }, {
            x: newDateString(4),
            y: randomScalingFactor()
        }, {
            x: newDateString(5),
            y: randomScalingFactor()
        }],
    }, {
        label: "Dataset with date object point data",
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        fill: false,
        data: [{
            x: newDate(0),
            y: randomScalingFactor()
        }, {
            x: newDate(2),
            y: randomScalingFactor()
        }, {
            x: newDate(4),
            y: randomScalingFactor()
        }, {
            x: newDate(5),
            y: randomScalingFactor()
        }]
    }]
};

export const Dashboard = () => {

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <Sidebar />

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Box sx={{ mb: 3 }}>
                    <Card sx={{ minWidth: 275 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom component="div">
                                Event Timeline
                            </Typography>
                            <PhaseChart />
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
                                options={options}
                                data={data}
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
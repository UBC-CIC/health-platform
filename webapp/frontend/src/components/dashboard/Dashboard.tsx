import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {
    CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title,
    Tooltip
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import React from 'react';
import { Line } from 'react-chartjs-2';
import './dashboard.css';
import { Sidebar } from './Sidebar';




const faker = require('faker');

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin
);

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

// const config = {
//     type: 'line',
//     data: {
//         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//         datasets: [{
//             label: 'My First Dataset',
//             data: [65, 59, 80, 81, 56, 55, 40],
//             fill: false,
//             borderColor: 'rgb(75, 192, 192)',
//             tension: 0.1
//         }]
//     },
//     options: {
//         plugins: {
//             autocolors: false,
//             annotation: {
//                 annotations: {
//                     box1: {
//                         // Indicates the type of annotation
//                         type: 'box',
//                         xMin: 1,
//                         xMax: 2,
//                         yMin: 50,
//                         yMax: 70,
//                         backgroundColor: 'rgba(255, 99, 132, 0.25)'
//                     }
//                 }
//             }
//         }
//     }
// };

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
                                Timeline
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
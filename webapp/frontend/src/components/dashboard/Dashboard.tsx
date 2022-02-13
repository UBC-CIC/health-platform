import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useContext, useEffect, useState } from 'react';
import './dashboard.css';
import { Sidebar } from './Sidebar';
import moment from 'moment';
import { getPatientsDetail, getEventDetailsByUser, query } from '../../common/graphql/queries';
import { API, Auth } from 'aws-amplify';
import { CircularProgress, Grid, LinearProgress } from '@mui/material';
import { ThemeColor } from './types';
import EventCreate from '../events/EventCreate';
import { getAbsoluteTimeFromRelativeTime, subtractHours } from '../../utils/time';
import { EventDetail } from '../../common/types/API';
import { differenceInSeconds } from 'date-fns';
import ReactApexChart from "react-apexcharts";
import { LineChart } from './LineChart';


const DEFAULT_HOURS_AGO = 6;

interface Module {
    "sensor_type": string;
    "sensor_name": string;
}
interface DataSeries {
    data: number[][];
}

export const Dashboard = (props: { 
    userName: any, 
    userId: any,
}) => {
    
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
    const [eventsData, setEventsData] = useState<any>([]);

    const [modules, setModules] = useState<any>([]);
    const [modulesOptions, setModulesOptions] = useState<any>({});
    const [modulesData, setModulesData] = useState<Map<string, DataSeries[]>>(new Map<string, DataSeries[]>());

    useEffect(() => {
        update();
    }, []);

    async function callGetPatientsDetail(): Promise<Module[]> {
        try {
            const patientsDetail: any = await API.graphql({
                query: getPatientsDetail,
                variables: {
                    patientId: props.userId,
                    limit: 100,
                }
            });
            console.log("callGetPatientsDetail");
            console.log(patientsDetail);
            
            const modules = patientsDetail["data"]["getPatientsDetail"]["sensor_types"].map((st: string) => {
                let sensorName = "";
                if (st === "HeartRate") {
                    sensorName = "Heart Rate";
                } else if (st === "Temperature") {
                    sensorName = "Temperature";
                } else if (st === "cpu_utilization") {
                    sensorName = "CPU Utilization";
                } else if (st === "memory_utilization") {
                    sensorName = "Memory Utilization";
                }
            
                return {
                    "sensor_type": st,
                    "sensor_name": sensorName,
                }
            });

            const newModulesLoading: any = {};
            const newModulesOptions: any = {};
            patientsDetail["data"]["getPatientsDetail"]["sensor_types"].forEach((st: string) => {
                newModulesLoading[st] = true;
                newModulesOptions[st] = {
                    chart: {
                        id: st,
                        group: 'social',
                        type: 'scatter',
                        height: 160,
                        animations: {
                            enabled: false,
                        },
                    },
                    stroke: {
                        curve: 'straight',
                        width: 1,
                    },
                    xaxis: {
                        type: 'datetime',
                    },
                    colors: ['#008FFB']
                };
            });
            
            setModules(modules);
            setModulesOptions(newModulesOptions);
            return modules;
        } catch (e) {
            console.log('callGetPatientsDetail errors:', e );
            return [];
        }
    }

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

            const itemsReturned: Array<EventDetail> = events['data']['getEventDetailsByUser']['items'];

            const phases: any[] = [];
            phases.push([new Date(searchProperties.start).getTime(), 0]);
            for (var event of itemsReturned) {
                phases.push([new Date(event.start_date_time!).getTime(), 1]);
                phases.push([new Date(event.end_date_time!).getTime(), 1]);
                phases.push([new Date(event.end_date_time!).getTime() + 1, 0]);
            }

            console.log('PHASES:', phases);
            setEventsData([{
                data: phases
            }]);
        } catch (e) {
            console.log('getEventDetailsByUser errors:', e );
        }
    }

    async function update() {
        // TODO: Make this more efficient
        let modules = await callGetPatientsDetail();

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
        const measureNameToVals = new Map<string, DataSeries[]>();
        
        columns.forEach((item: string, index: number) => {
            columnToIndex.set(item, index);
        });

        modules.forEach((module: Module) => {
            measureNameToVals.set(module.sensor_type, [{
                data: [],
            }]);
        })

        rows.forEach((row: string[], index: number) => {
            // Timestream does not have timezone support
            const t = row[columnToIndex.get("binned_timestamp")!]
            const timestamp = moment(`${t}Z`).valueOf(); // Get epoch milliseconds
            const measureName = row[columnToIndex.get("measure_name")!]
            const val = row[columnToIndex.get("measure_val")!]
            if (val !== "" && Number(val)) {
                measureNameToVals.get(measureName)![0].data.push([timestamp, +val]);
            }
        });

        console.log('MODULES DATA:', measureNameToVals);
        setModulesData(measureNameToVals);
        return false;
    }

    function generateDayWiseTimeSeries(baseval: any, count: any, yrange: any) {
        var i = 0;
        var series = [];
        while (i < count) {
            var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

            series.push([baseval, y]);
            baseval += 86400000;
            i++;
        }
        return series;
    }

    const eventsOptions: any = {
        chart: {
            id: 'events',
            group: 'social',
            type: 'area',
            height: 160,
            animations: {
                enabled: false,
            },
        },
        fill: {
            type: 'solid',
            opacity: [0.35, 1],
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 0,
        },
        xaxis: {
            type: 'datetime',
        },
        stroke: {
            curve: 'stepline',
            width: 1,
        },
        tooltip: {
            shared: false,
            y: {
                formatter: function (val: any) {
                    return (val / 1000000).toFixed(0)
                }
            }
        },
        colors: ['#00E396']
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

                            <ReactApexChart options={eventsOptions} series={eventsData} type="bar" height={160} />
                        </CardContent>
                    </Card>
                </Box>
                {
                    modules.map((module: any) => (
                        <Box sx={{ mb: 3 }} key={module.sensor_type}>
                            <Card sx={{ minWidth: 275 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom component="div">
                                        {module.sensor_name}
                                    </Typography>

                                    {
                                        (!(module.sensor_type in modulesOptions) || !(modulesData.has(module.sensor_type))) ? (
                                            <Box
                                                style={{ height: '120px', margin: 'auto', textAlign: 'center', paddingTop: '36px', color: ThemeColor.MediumContrast }}
                                            >
                                                <CircularProgress size={12} color='inherit' />{' '}Loading...
                                            </Box>
                                        ) : (modulesData.get(module.sensor_type)![0].data.length === 0) ? (
                                            <Box
                                                style={{ height: '120px', margin: 'auto', textAlign: 'center', paddingTop: '36px', color: ThemeColor.MediumContrast }}
                                            >
                                                No Data Found
                                            </Box>
                                        ) : (
                                            <ReactApexChart options={modulesOptions[module.sensor_type]} series={modulesData.get(module.sensor_type)} type="scatter" height={350} />
                                        )
                                    }
                                    {/* <Timeline /> */}
                                </CardContent>
                            </Card>
                        </Box>
                    ))
                }
            </Box>
        </Box>
    )
}

export default Dashboard;
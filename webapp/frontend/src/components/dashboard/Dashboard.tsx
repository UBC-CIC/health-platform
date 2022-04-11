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
import { getPatientsDetail, getEventDetailsByUser, query, getUsersDetail, getEventDetailsByUserAndCreateTime } from '../../common/graphql/queries';
import { API, Auth } from 'aws-amplify';
import { CircularProgress, Grid, LinearProgress } from '@mui/material';
import { ThemeColor } from './types';
import EventCreate from '../events/EventCreate';
import { getAbsoluteTimeFromRelativeTime, subtractHours } from '../../utils/time';
import { EventDetail, PatientsDetail, UsersDetail } from '../../common/types/API';
import ReactApexChart from "react-apexcharts";
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';

const DEFAULT_HOURS_AGO = 12;

interface Module {
    "sensor_type": string;
    "sensor_name": string;
}
interface DataSeries {
    data: number[][];
}

const initialEventsOptions: any = {
    chart: {
        id: 'events',
        group: 'metrics',
        type: 'area',
        height: 160,
        animations: {
            enabled: true,
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
        min: subtractHours(new Date(), DEFAULT_HOURS_AGO).getTime(),
        max: new Date().getTime(),
        labels: {
            datetimeUTC: false
        }
    },
    stroke: {
        curve: 'stepline',
        width: 1,
    },
    tooltip: {
        enabled: true
    }
};

const initialModulesOptions: any = {};

export const Dashboard = (props: { 
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
        period: queryModel["period"] ? queryModel["period"] : "5m",
        statistic: queryModel["statistic"] ? queryModel["statistic"] : "avg",
        patient: queryModel["patient"] ? queryModel["patient"] : "all",
        showOverlay: queryModel["showOverlay"] ? queryModel["showOverlay"] === 'true' : true,
        useLocalTimezone: queryModel["useLocalTimezone"] ? queryModel["useLocalTimezone"] === 'true' : true
    });

    // These fields are used to re-load the charts when the options change due to a bug in the charting library.
    // See: https://github.com/apexcharts/react-apexcharts/issues/151
    const [updatedEventsOptionsFlag, setUpdatedEventsOptionsFlag] = useState(false);
    const [updatedModulesOptionsFlag, setUpdatedModulesOptionsFlag] = useState(false);

    const [isLoading, setIsLoading] = useState<any>(false);
    const [eventsData, setEventsData] = useState<any>([]);

    const [modules, setModules] = useState<any>([]);
    const [modulesData, setModulesData] = useState<any>({});

    useEffect(() => {
        if (Object.keys(props.userDetail).length > 0 && props.patients.length > 0) {
            update();
        }
    }, []);

    useEffect(() => {
        if (updatedEventsOptionsFlag) {
            setUpdatedEventsOptionsFlag(false);
        }
    }, [updatedEventsOptionsFlag]);

    useEffect(() => {
        if (updatedModulesOptionsFlag) {
            setUpdatedModulesOptionsFlag(false);
        }
    }, [updatedModulesOptionsFlag]);

    async function callGetPatientsDetail(): Promise<Module[]> {
        try {
            const sensorTypesArr: Array<string> = [];
            for (const patient of props.patients) {
                for (const st of patient.sensor_types!) {
                    sensorTypesArr.push(st!)
                }
            }

            const sensorTypes = Array.from(new Set(sensorTypesArr));
            sensorTypes.sort();
            const modules = sensorTypes.map((st: string) => {
                let sensorName = "";
                if (st === "HeartRate") {
                    sensorName = "Heart Rate";
                } else if (st === "HeartRateVariability") {
                    sensorName = "Heart Rate Variability";
                } else {
                    sensorName = st;
                }

                return {
                    "sensor_type": st,
                    "sensor_name": sensorName,
                }
            });

            const newModulesLoading: any = {};
            sensorTypes.forEach((st: string) => {
                newModulesLoading[st] = true;
            });
            
            setModules(modules);
            return modules;
        } catch (e) {
            console.log('callGetPatientsDetail errors:', e );
            return [];
        }
    }

    async function callListAllEvents(start: any, end: any) {
        try {
            const patientIds = searchProperties.patient === "all" ? props.userDetail.patient_ids : [searchProperties.patient];
            const eventsData = [];
            if (patientIds) {
                for (const patientId of patientIds) {
                    const events: any = await API.graphql({
                        query: getEventDetailsByUserAndCreateTime,
                        variables: {
                            userId: patientId,
                            startTime: start.toISOString(),
                            endTime: end.toISOString(),
                            limit: 100,
                        }
                    });
                    console.log("callListAllEvents");
                    console.log(events);

                    const itemsReturned: Array<EventDetail> = events['data']['getEventDetailsByUserAndCreateTime']['items'];

                    const phases: any[] = [];
                    phases.push([new Date(searchProperties.start).getTime(), 0]);
                    for (var event of itemsReturned) {
                        phases.push([new Date(event.start_date_time!).getTime(), 1]);
                        phases.push([new Date(event.end_date_time!).getTime(), 1]);
                        phases.push([new Date(event.end_date_time!).getTime() + 1, 0]);
                    }

                    console.log('PHASES:', phases);

                    let patientName = "";
                    for (const pt of props.patients) {
                        if (patientId === pt.patient_id) {
                            patientName = pt.name!;
                        }
                    }
                    eventsData.push({
                        name: patientName,
                        data: phases,
                    });
                }
            }
            setEventsData(eventsData);
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

        history.push(`/dashboard?start=${start.getTime()}&end=${end.getTime()}&startRelative=${searchProperties.startRelative}&endRelative=${searchProperties.endRelative}&type=${searchProperties.type}&period=${searchProperties.period}&statistic=${searchProperties.statistic}&patient=${searchProperties.patient}&showOverlay=${searchProperties.showOverlay}&useLocalTimezone=${searchProperties.useLocalTimezone}`);

        // Update the graph boundaries
        initialEventsOptions.xaxis = {
            ...initialEventsOptions.xaxis,
            min: start.getTime(),
            max: end.getTime(),
            labels: {
                datetimeUTC: !searchProperties.useLocalTimezone
            }
        };
        setUpdatedEventsOptionsFlag(true);

        callListAllEvents(start, end);

        // Run the update logic
        //
        const input = {
            "patient_ids": searchProperties.patient === "all" ? props.userDetail.patient_ids : [searchProperties.patient],
            "period": searchProperties.period,
            "statistic": searchProperties.statistic,
            "start": start,
            "end": end,
        };
        console.log(`callQueryRequest request with ${JSON.stringify(input)}`);
    
        modules.forEach((module: any) => {
            const newOptions = getChartOptions(module, start.getTime(), end.getTime(), !searchProperties.useLocalTimezone);
            initialModulesOptions[module.sensor_type] = newOptions;
        });
        setUpdatedModulesOptionsFlag(true);

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
        const measureNameToVals: any = {};
        
        columns.forEach((item: string, index: number) => {
            columnToIndex.set(item, index);
        });

        const patientToIndex: any = {};
        modules.forEach((module: Module) => {
            if (searchProperties.patient === "all") {
                measureNameToVals[module.sensor_type] = [];
                var p = 0
                for (const pt of props.patients) {
                    measureNameToVals[module.sensor_type].push({
                        name: pt.name,
                        data: [],
                    });
                    patientToIndex[pt.patient_id!] = p;
                    p++;
                }
            } else {
                measureNameToVals[module.sensor_type] = [{
                    data: [],
                }];
            }
        })

        rows.forEach((row: string[], index: number) => {
            // Timestream does not have timezone support
            const patientId = row[columnToIndex.get("patient_id")!]
            const t = row[columnToIndex.get("binned_timestamp")!]
            const timestamp = moment(`${t}Z`).valueOf(); // Get epoch milliseconds
            const measureName = row[columnToIndex.get("measurement_type")!]
            const val = row[columnToIndex.get("measure_val")!]
            if (val !== "" && Number(val) && measureName in measureNameToVals) {
                if (searchProperties.patient === "all") {
                    measureNameToVals[measureName]![patientToIndex[patientId]].data.push([timestamp, +val]);
                } else {
                    measureNameToVals[measureName]![0].data.push([timestamp, +val]);
                }
            }
        });

        console.log('MODULES DATA:', measureNameToVals);
        setModulesData(measureNameToVals);

        return false;
    }

    function getChartOptions(sensorType: string, min: number, max: number, useUTC: boolean): any {
        return {
            chart: {
                id: sensorType,
                group: 'metrics',
                type: 'scatter',
                animations: {
                    enabled: true,
                },
            },
            stroke: {
                curve: 'straight',
                width: 1,
            },
            xaxis: {
                type: 'datetime',
                min: min,
                max: max,
                labels: {
                    datetimeUTC: useUTC
                }
            },
            onItemClick: {
                toggleDataSeries: false
            },
            tooltip: {
                enabled: false
            }
        };
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <Sidebar
                searchProperties={searchProperties}
                setSearchProperties={setSearchProperties}
                isLoading={isLoading}
                update={update}
                patients={props.patients}
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
                                <EventCreate userName={props.userName} patients={props.patients} disabled="true" updateFn={update} />
                            </Box>

                            {!updatedEventsOptionsFlag && (
                                <>
                                    <ReactApexChart options={initialEventsOptions} series={eventsData} type="area" height={160} />
                                </>
                            )}
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
                                        (!(module.sensor_type in initialModulesOptions) || !(module.sensor_type in modulesData)) ? (
                                            <Box
                                                style={{ height: '120px', margin: 'auto', textAlign: 'center', paddingTop: '36px', color: ThemeColor.MediumContrast }}
                                            >
                                                <CircularProgress size={12} color='inherit' />{' '}Loading...
                                            </Box>
                                        ) : (modulesData[module.sensor_type]!.reduce((sum: number, current: any) => sum + current.data.length, 0) === 0) ? (
                                            <Box
                                                style={{ height: '120px', margin: 'auto', textAlign: 'center', paddingTop: '36px', color: ThemeColor.MediumContrast }}
                                            >
                                                No Data Found
                                            </Box>
                                        ) : (
                                            <>
                                                {!updatedModulesOptionsFlag && (
                                                    <>
                                                        <ReactApexChart options={initialModulesOptions[module.sensor_type]} series={modulesData[module.sensor_type]} type="scatter" height={350} />
                                                    </>
                                                )}
                                            </>
                                        )
                                    }
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
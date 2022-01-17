import { DateTimePicker, LoadingButton, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { Button, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Switch, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';
import "./sidebar.css";


const DRAWER_WIDTH = 300;

export const Sidebar = () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [timeType, setTimeType] = React.useState('absolute');
    const [period, setPeriod] = React.useState('1h');
    const [statistic, setStatistic] = React.useState('average');
    const [relativeShortCut, setRelativeShortCut] = React.useState("3h");
    const [relativeStart, setRelativeStart] = React.useState({
        "scale": "h",
        "value": "3",
    });
    const [relativeEnd, setRelativeEnd] = React.useState({
        "scale": "h",
        "value": "0",
    });
    const [start, setStart] = React.useState("2021-08-18T21:11:54");
    const [end, setEnd] = React.useState("2021-10-18T21:11:54");
    const [showOverlay, setShowOverlay] = React.useState(false);

    const handleTimeChange = (event: any) => {
        if (timeType === "absolute") {
            setTimeType("relative");
        } else {
            setTimeType("absolute");
        }
    };

    const handleRelativeTimeValue = (event: any, type: string) => {
        const val = event.target.value;
        setRelativeShortCut("");
        if (type === "start") {
            setRelativeStart({
                "scale": relativeStart.scale,
                "value": val,
            });

            if (relativeEnd.value === "0") {
                setRelativeShortCut(val + relativeStart.scale);
            }
        } else {
            setRelativeEnd({
                "scale": relativeEnd.scale,
                "value": val,
            });

            if (relativeEnd.value === "0") {
                setRelativeShortCut(val + relativeEnd.scale);
            }
        }
    }

    const handleRelativeTimeScale = (event: any, type: string) => {
        const val = event.target.value;
        setRelativeShortCut("");
        if (type === "start") {
            setRelativeStart({
                "scale": val,
                "value": relativeStart.value,
            });

            if (relativeEnd.value === "0") {
                setRelativeShortCut(val + relativeStart.scale);
            }
        } else {
            setRelativeEnd({
                "scale": val,
                "value": relativeStart.value,
            });

            if (relativeEnd.value === "0") {
                setRelativeShortCut(val + relativeStart.scale);
            }
        }
    }

    const handleRelativeShortCut = (event: any) => {
        const shortCut = event.target.value;
        setRelativeShortCut(shortCut);
        if (shortCut === "1h") {
            setRelativeStart({
                "value": "1",
                "scale": "h"
            });
            setRelativeEnd({
                "value": "0",
                "scale": "h"
            });
        } else if (shortCut === "3h") {
            setRelativeStart({
                "value": "3",
                "scale": "h"
            });
            setRelativeEnd({
                "value": "0",
                "scale": "h"
            });
        } else if (shortCut === "12h") {
            setRelativeStart({
                "value": "12",
                "scale": "h"
            });
            setRelativeEnd({
                "value": "0",
                "scale": "h"
            });
        } else if (shortCut === "1d") {
            setRelativeStart({
                "value": "1",
                "scale": "d"
            });
            setRelativeEnd({
                "value": "0",
                "scale": "d"
            });
        } else if (shortCut === "1w") {
            setRelativeStart({
                "value": "7",
                "scale": "d"
            });
            setRelativeEnd({
                "value": "0",
                "scale": "d"
            });
        }
    };

    const update = (event: any) => {
        setIsLoading(true);
    }

    return (
        <Drawer
            className="sidebar"
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
            }}
        >
            <Toolbar />

            <Box sx={{ overflow: 'auto', pl: 2, pr: 2, pt: 4 }}>
                {
                    !isLoading ? 
                    <Button variant={"contained"} color={"primary"} onClick={update} fullWidth>
                        Update Dashboard
                    </Button> : 
                    <LoadingButton loading loadingPosition="start" variant={"contained"} color={"primary"} fullWidth>
                        Loading...
                    </LoadingButton>
                }
            </Box>
            <Box sx={{ overflow: 'auto', pl: 2, pr: 2, pt: 4 }}>
                <Box sx={{ overflow: 'auto', mb: 3 }}>
                    <ToggleButtonGroup
                        color="primary"
                        value={timeType}
                        size="small"
                        exclusive
                        fullWidth
                        onChange={handleTimeChange}>
                        <ToggleButton value="absolute">Absolute</ToggleButton>
                        <ToggleButton value="relative">Relative</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {
                    timeType === "absolute" ?
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
                            <DateTimePicker
                                label="Start Time"
                                value={start}
                                onChange={(event: any) => setStart(event.target.value)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                        <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
                            <DateTimePicker
                                label="End Time"
                                value={end}
                                onChange={(event: any) => setEnd(event.target.value)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                    </LocalizationProvider>
                    : 
                    <>
                        <ToggleButtonGroup
                            color="primary"
                            value={relativeShortCut}
                            size="small"
                            exclusive
                            fullWidth
                            onChange={handleRelativeShortCut}>
                            <ToggleButton value="1h">1h</ToggleButton>
                            <ToggleButton value="3h">3h</ToggleButton>
                            <ToggleButton value="12h">12h</ToggleButton>
                            <ToggleButton value="1d">1d</ToggleButton>
                            <ToggleButton value="1w">1w</ToggleButton>
                        </ToggleButtonGroup>

                        <FormControl sx={{ marginTop: 2 }} variant="outlined" fullWidth>
                            <TextField
                                className="outlined-input-relative"
                                type={'text'}
                                value={relativeStart.value}
                                label="Start"
                                fullWidth
                                onChange={(event: any) => handleRelativeTimeValue(event, "start")}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <Select
                                                value={relativeStart.scale}
                                                displayEmpty
                                                onChange={(event: any) => handleRelativeTimeScale(event, "start")}
                                            >
                                                <MenuItem value="m">minutes ago</MenuItem>
                                                <MenuItem value="h">hours ago</MenuItem>
                                                <MenuItem value="d">days ago</MenuItem>
                                            </Select>
                                        </InputAdornment>
                                }}
                            />
                        </FormControl>
                        <FormControl sx={{ marginTop: 2, marginBottom: 1 }} variant="outlined" fullWidth>
                            <TextField
                                className="outlined-input-relative"
                                type={'text'}
                                value={relativeEnd.value}
                                label="End"
                                fullWidth
                                onChange={(event: any) => handleRelativeTimeValue(event, "end")}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <Select
                                                value={relativeEnd.scale}
                                                displayEmpty
                                                onChange={(event: any) => handleRelativeTimeScale(event, "end")}
                                            >
                                                <MenuItem value="m">minutes ago</MenuItem>
                                                <MenuItem value="h">hours ago</MenuItem>
                                                <MenuItem value="d">days ago</MenuItem>
                                            </Select>
                                        </InputAdornment>
                                }}
                            />
                        </FormControl>
                    </>
                }
               
                <hr />
                <Box sx={{ mt: 3, mb: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel id="period-select-label">Period</InputLabel>
                        <Select
                            labelId="period-select-label"
                            id="period-select"
                            value={period}
                            label="Period"
                            onChange={(event: any) => setPeriod(event.target.value)}
                        >
                            <MenuItem value="1s">1 Second</MenuItem>
                            <MenuItem value="1m">1 Minute</MenuItem>
                            <MenuItem value="5m">5 Minutes</MenuItem>
                            <MenuItem value="1h">1 Hour</MenuItem>
                            <MenuItem value="1d">1 Day</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel id="statistic-select-label">Statistic</InputLabel>
                        <Select
                            labelId="statistic-select-label"
                            id="statistic-select"
                            value={statistic}
                            label="Statistic"
                            onChange={(event: any) => setStatistic(event.target.value)}
                        >
                            <MenuItem value="average">Average</MenuItem>
                            <MenuItem value="max">Max</MenuItem>
                            <MenuItem value="min">Min</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <hr />
                <FormGroup>
                    <FormControlLabel control={<Switch checked={showOverlay} onChange={(event: any) => setShowOverlay(!showOverlay)} />} label="Overlay Events" />
                </FormGroup>
            </Box>
        </Drawer>
    )
}

export default Sidebar;

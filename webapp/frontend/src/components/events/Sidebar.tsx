import { DateTimePicker, LoadingButton, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { Button, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Switch, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';
import { propTypes } from 'react-notification-system';
import { PatientsDetail } from '../../common/types/API';
import { getRelativeScale, getRelativeValue } from '../../utils/time';
import { EventCreate } from '../events/EventCreate';
import "./sidebar.css";


const DRAWER_WIDTH = 300;

type SidebarProps = {
    searchProperties: any;
    setSearchProperties: any;
    isLoading: boolean;
    update: any;
    patients: PatientsDetail[];
    userName: string;
};

export const Sidebar = ({
    searchProperties, setSearchProperties, isLoading, update, patients, userName
}: SidebarProps) => {
    const [relativeShortCut, setRelativeShortCut] = React.useState("3h"); // e.g. quicklinks to 3h, 12h, etc.

    const toggleTimeTypeChange = (event: any) => {
        if (searchProperties.type === "absolute") {
            handleSearchPropertyChange("type", "relative");
        } else {
            handleSearchPropertyChange("type", "absolute");
        }
    };

    const handleRelativeTimeValue = (event: any, type: string) => {
        console.log("handleRelativeTimeValue: ", type)
        const val = event.target.value;

        if (type === "start") {
            setRelativeShortCut(`${val}${getRelativeScale(searchProperties.startRelative)}`);
            handleSearchPropertyChange("startRelative", `${val}${getRelativeScale(searchProperties.startRelative)}`);
        } else {
            setRelativeShortCut(`${val}${getRelativeScale(searchProperties.endRelative)}`);
            handleSearchPropertyChange("endRelative", `${val}${getRelativeScale(searchProperties.endRelative)}`);
        }
    }

    const handleRelativeTimeScale = (event: any, type: string) => {
        const scale = event.target.value;
        if (type === "start") {
            setRelativeShortCut(`${getRelativeValue(searchProperties.startRelative)}${scale}`);
            handleSearchPropertyChange("startRelative", `${getRelativeValue(searchProperties.startRelative)}${scale}`);
        } else {
            setRelativeShortCut(`${getRelativeValue(searchProperties.endRelative)}${scale}`);
            handleSearchPropertyChange("endRelative", `${getRelativeValue(searchProperties.endRelative)}${scale}`);
        }
    }

    const handleRelativeShortCut = (event: any) => {
        const shortCut = event.target.value;
        setRelativeShortCut(shortCut);
        setSearchProperties({
            ...searchProperties,
            "startRelative": shortCut,
            "endRelative": `0${getRelativeScale(shortCut)}`,
        });
    };

    const handleSearchPropertyChange = (field: string, newVal: string) => {
        setSearchProperties({
            ...searchProperties,
            [field]: newVal,
        });
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
                        Update Events
                    </Button> : 
                    <LoadingButton loading variant={"contained"} color={"primary"} fullWidth>
                        Loading...
                    </LoadingButton>
                }
            </Box>
            <Box sx={{ overflow: 'auto', pl: 2, pr: 2, pt: 4 }}>
                <Box sx={{ mt: 0, mb: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel id="patient-select-label">Patient</InputLabel>
                        <Select
                            labelId="patient-select-label"
                            id="patient-select"
                            value={searchProperties.patient}
                            label="Patient"
                            onChange={(event: any) => handleSearchPropertyChange("patient", event.target.value)}
                        >
                            <MenuItem value="all">All Patients</MenuItem>
                            {patients.map((patient: PatientsDetail) => (
                                <MenuItem value={patient.patient_id}>{patient.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ overflow: 'auto', mb: 3 }}>
                    <ToggleButtonGroup
                        color="primary"
                        value={searchProperties.type}
                        size="small"
                        exclusive
                        fullWidth
                        onChange={toggleTimeTypeChange}>
                        <ToggleButton value="relative">Relative</ToggleButton>
                        <ToggleButton value="absolute">Absolute</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {
                    searchProperties.type === "absolute" ?
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
                            <DateTimePicker
                                label="Start Time"
                                value={searchProperties.start}
                                onChange={(value: any) => handleSearchPropertyChange("start", value)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                        <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
                            <DateTimePicker
                                label="End Time"
                                value={searchProperties.end}
                                onChange={(value: any) => handleSearchPropertyChange("end", value)}
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
                                value={getRelativeValue(searchProperties.startRelative)}
                                label="Start"
                                fullWidth
                                onChange={(event: any) => handleRelativeTimeValue(event, "start")}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <Select
                                                value={getRelativeScale(searchProperties.startRelative)}
                                                displayEmpty
                                                onChange={(event: any) => handleRelativeTimeScale(event, "start")}
                                            >
                                                <MenuItem value="m">minutes ago</MenuItem>
                                                <MenuItem value="h">hours ago</MenuItem>
                                                <MenuItem value="d">days ago</MenuItem>
                                                <MenuItem value="w">weeks ago</MenuItem>
                                            </Select>
                                        </InputAdornment>
                                }}
                            />
                        </FormControl>
                        <FormControl sx={{ marginTop: 2, marginBottom: 1 }} variant="outlined" fullWidth>
                            <TextField
                                className="outlined-input-relative"
                                type={'text'}
                                value={getRelativeValue(searchProperties.endRelative)}
                                label="End"
                                fullWidth
                                onChange={(event: any) => handleRelativeTimeValue(event, "end")}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <Select
                                                value={getRelativeScale(searchProperties.endRelative)}
                                                displayEmpty
                                                onChange={(event: any) => handleRelativeTimeScale(event, "end")}
                                            >
                                                <MenuItem value="m">minutes ago</MenuItem>
                                                <MenuItem value="h">hours ago</MenuItem>
                                                <MenuItem value="d">days ago</MenuItem>
                                                <MenuItem value="w">weeks ago</MenuItem>
                                            </Select>
                                        </InputAdornment>
                                }}
                            />
                        </FormControl>
                    </>
                }

                <hr />
                <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth>
                        <TextField fullWidth label="Event Search" id="eventSearch" />
                    </FormControl>
                </Box>
                <hr />
                <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth>
                        <div>
                            <EventCreate userName={userName} patients={patients} disabled="true" />
                        </div>
                    </FormControl>
                </Box>
                {/* <FormGroup>
                    <FormControlLabel control={<Switch defaultChecked onChange={(event: any) => toggleUseLocalTimezone()} />} label="Use Local Timezone" />
                </FormGroup> */}
            </Box>
        </Drawer>
    )
}

export default Sidebar;

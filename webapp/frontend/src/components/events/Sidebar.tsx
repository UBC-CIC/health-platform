import { Search } from '@mui/icons-material';
import { DateTimePicker, LoadingButton, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { Button, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import { PatientsDetail } from '../../common/types/API';
import { getRelativeScale, getRelativeValue } from '../../utils/time';
import "./sidebar.css";


const DRAWER_WIDTH = 300;

type SidebarProps = {
    searchProperties: any;
    setSearchProperties: any;
    isLoading: boolean;
    search: any;
    patients: PatientsDetail[];
};

export const Sidebar = ({
    searchProperties, setSearchProperties, isLoading, search, patients
}: SidebarProps) => {
    const toggleTimeTypeChange = (event: any) => {
        if (searchProperties.type === "absolute") {
            handleSingleSearchPropertyChange("type", "relative");
        } else {
            handleSingleSearchPropertyChange("type", "absolute");
        }
    };

    const getRelativeShortCut = () => {
        if (searchProperties.endRelative.startsWith("0")) {
            return searchProperties.startRelative;
        } else {
            return "";
        }
    }
    
    const handleRelativeTimeValue = (event: any, type: string) => {
        const val = event.target.value;

        if (type === "start") {
            if (type )
            handleSingleSearchPropertyChange("startRelative", `${val}${getRelativeScale(searchProperties.startRelative)}`);
        } else {
            handleSingleSearchPropertyChange("endRelative", `${val}${getRelativeScale(searchProperties.endRelative)}`);
        }
    }

    const handleRelativeTimeScale = (event: any, type: string) => {
        const scale = event.target.value;
        if (type === "start") {
            handleSingleSearchPropertyChange("startRelative", `${getRelativeValue(searchProperties.startRelative)}${scale}`);
        } else {
            handleSingleSearchPropertyChange("endRelative", `${getRelativeValue(searchProperties.endRelative)}${scale}`);
        }
    }

    const handleRelativeShortCut = (event: any) => {
        const shortCut = event.target.value;
        setSearchProperties({
            ...searchProperties,
            "startRelative": shortCut,
            "endRelative": `0${getRelativeScale(shortCut)}`,
        });
    };

    const handleSingleSearchPropertyChange = (field1: string, newVal1: string) => {
        setSearchProperties({
            ...searchProperties,
            [field1]: newVal1
        });
    }

    const handleSearchPropertyChange = (field1: string, newVal1: string, field2: string, newVal2: string) => {
        setSearchProperties({
            ...searchProperties,
            [field1]: newVal1,
            [field2]: newVal2
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
                    <Button variant={"contained"} color={"primary"} onClick={search} fullWidth>
                        Search Events
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
                            onChange={(event: any) => handleSingleSearchPropertyChange("patient", event.target.value)}
                        >
                            <MenuItem value="all">All Patients</MenuItem>
                            {patients.map((patient: PatientsDetail) => (
                                <MenuItem key={patient.patient_id} value={patient.patient_id!}>{patient.name}</MenuItem>
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
                                onChange={(value: any) => handleSingleSearchPropertyChange("start", value)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                        <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
                            <DateTimePicker
                                label="End Time"
                                value={searchProperties.end}
                                onChange={(value: any) => handleSingleSearchPropertyChange("end", value)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                    </LocalizationProvider>
                    : 
                    <>
                        <ToggleButtonGroup
                            color="primary"
                            value={getRelativeShortCut()}
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

                <Box sx={{ mb: 3 }}>
                    <FormControl sx={{ marginTop: 2, marginBottom: 1 }} fullWidth>
                        <TextField 
                            fullWidth 
                            label="Text Search" 
                            id="eventSearch" 
                            value={searchProperties.keyword}
                            onChange={(e) => {
                                handleSingleSearchPropertyChange("keyword", e.target.value);
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                              ),
                            }}
                        />
                    </FormControl>
                </Box>
            </Box>
        </Drawer>
    )
}

export default Sidebar;

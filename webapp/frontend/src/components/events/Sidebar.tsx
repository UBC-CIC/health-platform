import { DateTimePicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import React from "react";
import EventCreate from "./EventCreate";
import "./sidebar.css";

const DRAWER_WIDTH = 300;

export const Sidebar = () => {
  const [value, setValue] = React.useState(new Date("2014-08-18T21:11:54"));
  const [alignment, setAlignment] = React.useState("absolute");

  const handleChange = (newValue: any) => {
    setValue(newValue);
  };

  const handleTimeChange = (event: any, newAlignment: any) => {
    setAlignment(newAlignment);
  };

  return (
    <Drawer
      className="sidebar"
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto", pl: 2, pr: 2, pt: 4 }}>
        <Box sx={{ overflow: "auto", mb: 3 }}>
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            size="small"
            exclusive
            fullWidth
            onChange={handleTimeChange}
          >
            <ToggleButton value="absolute">Absolute</ToggleButton>
            <ToggleButton value="relative">Relative</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
            <DateTimePicker
              label="Start Time"
              value={value}
              onChange={handleChange}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
          <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
            <DateTimePicker
              label="End Time"
              value={value}
              onChange={handleChange}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
        </LocalizationProvider>
        <hr />
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <TextField fullWidth label="Event Search" id="eventSearch" />
          </FormControl>
        </Box>
              <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth>
                        <div>
                            <EventCreate user_id="abc" disabled="true"
                        />
                        </div>
                    </FormControl>
                </Box>
        <hr />
        <FormGroup>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Overlay Events"
          />
        </FormGroup>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

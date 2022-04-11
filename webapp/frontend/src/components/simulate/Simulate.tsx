import { DateTimePicker, LoadingButton, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { Alert, Button, FormControl, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import { API } from 'aws-amplify';
import queryString from 'query-string';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { simulate } from '../../common/graphql/mutations';
import { PatientsDetail, UsersDetail } from '../../common/types/API';
import { subtractHours } from '../../utils/time';
import { SENSORS } from '../patients/ManageSensors';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const DEFAULT_HOURS_AGO = 6;

export const Simulate = (props: { 
    userName: any, 
    userId: any,
    userDetail: UsersDetail,
    patients: PatientsDetail[],
}) => {    
    const [simulateProperties, setSimulateProperties] = React.useState<any>({
        start: subtractHours(new Date(), DEFAULT_HOURS_AGO),
        end: new Date(),
        patient: props.patients && props.patients.length > 0 ? props.patients[0].patient_id : "",
        sensor_id: "",
        measure_type: "",
        measure_value_low: 80,
        measure_value_high: 100,
        measure_step_seconds: 10
    });

    const [isLoading, setIsLoading] = useState<any>(false);
    const [showSuccess, setShowSuccess] = useState<any>(false);

    const handleSearchPropertyChange = (field: string, newVal: string) => {
        setSimulateProperties({
            ...simulateProperties,
            [field]: newVal,
        });
    }

    const handleSearchPropertyIntChange = (field: string, newVal: number) => {
        setSimulateProperties({
            ...simulateProperties,
            [field]: newVal,
        });
    }

    const handleSensorTypeChange = (event: any) => {
        const {
            target: { value },
        } = event;
        handleSearchPropertyIntChange('measure_type', value);
    };

    async function update() {
        setIsLoading(true);
        const input = {
            "patient_id": simulateProperties.patient,
            "sensor_id": simulateProperties.sensor_id,
            "measure_type": simulateProperties.measure_type,
            "measure_value_low": simulateProperties.measure_value_low,
            "measure_value_high": simulateProperties.measure_value_high,
            "measure_step_seconds": simulateProperties.measure_step_seconds,
            "timestamp_start": simulateProperties.start.toISOString(),
            "timestamp_end": simulateProperties.end.toISOString(),
        };

        const events: any = await API.graphql({
            query: simulate,
            variables: {
                input: input
            }
        });
        console.log("callSimulate");
        console.log(events);

        setShowSuccess(true);
        setIsLoading(false);
    }

    return (
        <Box sx={{ mt: 12 }}>
            {showSuccess && <Alert onClose={() => {setShowSuccess(false)}}>Successfully Updated Data</Alert>}

            <Box style={{maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto'}}>
                <Box sx={{ overflow: 'auto', pl: 2, pr: 2, pt: 4 }}>
                    {
                        !isLoading ? 
                        <Button variant={"contained"} color={"primary"} onClick={update} fullWidth>
                            Add Simulated Data
                        </Button> : 
                        <LoadingButton loading variant={"contained"} color={"primary"} fullWidth>
                            Inserting...
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
                                value={simulateProperties.patient}
                                label="Patient"
                                onChange={(event: any) => handleSearchPropertyChange("patient", event.target.value)}
                            >
                                {props.patients.map((patient: PatientsDetail) => (
                                    <MenuItem key={patient.patient_id} value={patient.patient_id}>{patient.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
                            <DateTimePicker
                                label="Start Time"
                                value={simulateProperties.start}
                                onChange={(value: any) => handleSearchPropertyChange("start", value)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                        <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
                            <DateTimePicker
                                label="End Time"
                                value={simulateProperties.end}
                                onChange={(value: any) => handleSearchPropertyChange("end", value)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                    </LocalizationProvider>
                
                    <hr />
                    <Box sx={{ mt: 3, mb: 3 }}>
                        <FormControl fullWidth variant="standard">
                            <TextField
                                required
                                label="Sensor ID"
                                value={simulateProperties.sensor_id}
                                onChange={(e) => {
                                    handleSearchPropertyChange('sensor_id', e.target.value);
                                }}
                            />
                        </FormControl>
                    </Box>
                    <Box sx={{ mt: 3, mb: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel id="sim-sensor-type-label">Sensor Type</InputLabel>
                            <Select
                                labelId="sim-sensor-type-label"
                                id="sim-sensor-type"
                                value={simulateProperties.measure_type}
                                onChange={handleSensorTypeChange}
                                input={<OutlinedInput label="Name" />}
                            >
                            {SENSORS.map((sensor) => (
                                <MenuItem
                                    key={sensor.id}
                                    value={sensor.id}
                                >
                                    {sensor.name}
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ mt: 3, mb: 3 }}>
                        <FormControl fullWidth variant="standard">
                            <TextField
                                required
                                label="Measure Min"
                                type='number'
                                value={simulateProperties.measure_value_low}
                                onChange={(e) => {
                                    handleSearchPropertyIntChange('measure_value_low', parseInt(e.target.value));
                                }}
                            />
                        </FormControl>
                    </Box>
                    <Box sx={{ mt: 3, mb: 3 }}>
                        <FormControl fullWidth variant="standard">
                            <TextField
                                required
                                label="Measure Max"
                                type='number'
                                value={simulateProperties.measure_value_high}
                                onChange={(e) => {
                                    handleSearchPropertyIntChange('measure_value_high', parseInt(e.target.value));
                                }}
                            />
                        </FormControl>
                    </Box>
                    <Box sx={{ mt: 3, mb: 3 }}>
                        <FormControl fullWidth>
                            <TextField
                                required
                                label="Sensor Step (sec)"
                                type='number'
                                value={simulateProperties.measure_step_seconds}
                                onChange={(e) => {
                                    handleSearchPropertyIntChange('measure_step_seconds', parseInt(e.target.value));
                                }}
                            />
                        </FormControl>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Simulate;

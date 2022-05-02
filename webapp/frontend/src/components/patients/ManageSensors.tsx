import {
    Button, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select, TableContainer, TextField
} from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, useTheme } from "@mui/system";
import { API } from "aws-amplify";
import { useState } from "react";
import { createSensorsDetail, deleteSensorsDetail, updatePatientsDetail } from "../../common/graphql/mutations";
import { getSensorsDetailByUser } from "../../common/graphql/queries";
import { PatientsDetail, SensorsDetail } from "../../common/types/API";
const { v4: uuidv4 } = require('uuid');

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

export const AIRTHINGS_WAVEPLUS = "AIRTHINGS_WAVEPLUS";
export const SENSORS = [
    {"name": "Heart Rate", "id": "HeartRate"},
    {"name": "Heart Rate Variability", "id": "HeartRateVariability"},
    {"name": "Steps", "id": "Steps"},
    {"name": "Airthings Wave Plus", "id": AIRTHINGS_WAVEPLUS},
];

function getStyles(name: any, personName: any, theme: any) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
}


export const ManageSensors = (props: { patientId: string, patient: PatientsDetail }) => {
    const theme = useTheme();

    const [items, updateItems] = useState<Array<SensorsDetail>>(new Array<SensorsDetail>());
    const [sensorsToRemove, setSensorsToRemove] = useState<Array<SensorsDetail>>(new Array<SensorsDetail>());
    const [sensorsToAdd, setSensorsToAdd] = useState<Array<SensorsDetail>>(new Array<SensorsDetail>());
    const [loading, setLoading] = useState<boolean>(true);
    const [open, setOpen] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [sensorId, setSensorId] = useState("");
    const [sensorTypes, setSensorTypes] = useState<Array<string>>(new Array<string>());
    const [clientKey, setClientKey] = useState("");
    const [clientSecretKey, setClientSecretKey] = useState("");

    const handleClose = () => {
        setOpen(false);
        setShowCreate(false);
    }

    const handleOpen = () => {
        callListAllSensors();
        setOpen(true);
    };

    async function callListAllSensors() {
        try {
            const sensorDetailObj: any = await API.graphql({
                query: getSensorsDetailByUser,
                variables: {
                    patientId: props.patientId,
                }
            });

            const sensorDetails: Array<SensorsDetail> = sensorDetailObj['data']['getSensorsDetailByUser']['items'];

            console.log(sensorDetails);
            setLoading(false);
            updateItems(sensorDetails);
        } catch (e) {
            setLoading(false);
            console.log('getUsersDetail errors:', e);
        }
    }

    const handleSensorTypeChange = (event: any) => {
        const {
            target: { value },
        } = event;
        setSensorTypes(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleAddSensor = () => {
        if (sensorId !== "") {
            const newSensor: SensorsDetail = {
                __typename: "SensorsDetail",
                sensor_id: sensorId,
                patient_id: props.patientId,
                sensor_types: sensorTypes,
            };
            if (sensorTypes.includes(AIRTHINGS_WAVEPLUS)) {
                newSensor.watermark = new Date(0).toISOString();
                newSensor.client_key = clientKey;
                newSensor.secret_key = clientSecretKey;
            }

            setSensorsToAdd([
                ...sensorsToAdd,
                newSensor,
            ]);
            setSensorsToRemove([
                ...sensorsToRemove.filter(i => i.sensor_id !== sensorId),
            ]);
            updateItems([
                ...items,
                newSensor,
            ]);
            setShowCreate(false);
        }
    };

    const handleRemoveSensor = (sensorId: string) => {
        if (sensorId !== "") {
            const found = items.find(i => i.sensor_id === sensorId);
            if (found) {
                setSensorsToRemove([
                    ...sensorsToRemove,
                    found,
                ]);
                setSensorsToAdd([
                    ...sensorsToAdd.filter(i => i.sensor_id !== sensorId),
                ]);
                updateItems([
                    ...items.filter(i => i.sensor_id !== sensorId),
                ]);
            }
            setShowCreate(false);
        }
    };

    const handleSave = async () => {
        if (sensorsToRemove.length > 0) {
            for (const sensorToRemove of sensorsToRemove) {
                console.log("Removing sensor " + JSON.stringify(sensorToRemove));
                try {
                    const response: any = await API.graphql({
                        query: deleteSensorsDetail,
                        variables: {
                            input: {
                                sensor_id: sensorToRemove.sensor_id,
                            }
                        },
                    });
                    console.log("deleteSensorsDetail response:", response);
                } catch (e) {
                    console.log("deleteSensorsDetail errors:", e);
                }
            }
        }
        if (sensorsToAdd.length > 0) {
            for (const sensorToAdd of sensorsToAdd) {
                console.log("Adding sensor " + JSON.stringify(sensorToAdd));
                try {
                    const response: any = await API.graphql({
                        query: createSensorsDetail,
                        variables: { 
                            input: {
                                sensor_id: sensorToAdd.sensor_id,
                                patient_id: sensorToAdd.patient_id,
                                sensor_types: sensorToAdd.sensor_types,
                                watermark: sensorToAdd.watermark,
                                client_key: sensorToAdd.client_key,
                                secret_key: sensorToAdd.secret_key,
                            }
                        },
                    });
                    console.log("createSensorsDetail response:", response);
                } catch (e) {
                    console.log("createSensorsDetail errors:", e);
                }
            }
        }


        try {
            const remainingSensorTypes = new Set<String>();
            for (const item of items) {
                for (const st of item.sensor_types!) {
                    remainingSensorTypes.add(st!);
                }
            }

            const response: any = await API.graphql({
                query: updatePatientsDetail,
                variables: {
                    input: {
                        ...props.patient,
                        sensor_types: [...Array.from(remainingSensorTypes)]
                    }
                },
            });
            console.log("updatePatientsDetail response:", response);
        } catch (e) {
            console.log("updatePatientsDetail errors:", e);
        }

        // TODO: Update table to avoid reloading page
        window.location.reload();
    };

    // const handleCreateRequest = async () => {
    //     setOpen(true);

    //     console.log(start, end, medication, mood, food, notes);

    //     const eventDetail: EventDetailInput = {
    //         event_id: uuidv4(),
    //         user_id: props.patientId,
    //         start_date_time: start,
    //         end_date_time: end,
    //         medication: medication,
    //         mood: mood,
    //         food: food,
    //         notes: notes
    //     };
    //     console.log("createEventDetail request:", eventDetail);

    //     try {
    //         const response: any = await API.graphql({
    //             query: createEventDetail,
    //             variables: { input: eventDetail },
    //         });
    //         console.log("createEventDetail response:", response);

    //         setOpen(false);

    //     } catch (e) {
    //         console.log("createEventDetail errors:", e);
    //     }
    // };

    return (
        <>
            <Button variant="text" size="small" onClick={handleOpen}>
                Manage
            </Button>
            <Dialog open={open} onClose={handleClose}
                fullWidth
                maxWidth="xl"
            >
                {
                    showCreate ? (
                        <DialogTitle>Add Sensor</DialogTitle>
                    ) : (
                        <DialogTitle>Manage Sensors</DialogTitle>
                    )
                }
                <DialogContent>
                    <Box>

                    {showCreate ? (
                        <Box
                            sx={{
                                mt: 1,
                                "& .MuiTextField-root": { marginBottom: 1, width: "100%" },
                            }}
                        >
                            <TextField
                                required
                                label="Sensor ID"
                                value={sensorId}
                                onChange={(e) => {
                                    setSensorId(e.target.value);
                                }}
                            />
                            <FormControl sx={{ width: 800, mt: 2 }}>
                                <InputLabel id="sensor-type-label">Types</InputLabel>
                                <Select
                                    labelId="sensor-type-label"
                                    id="sensor-type-label"
                                    multiple
                                    value={sensorTypes}
                                    onChange={handleSensorTypeChange}
                                    input={<OutlinedInput label="Name" />}
                                    MenuProps={MenuProps}
                                >
                                {SENSORS.map((sensor) => (
                                    <MenuItem
                                        key={sensor.id}
                                        value={sensor.id}
                                        style={getStyles(sensor.id, sensorTypes, theme)}
                                    >
                                        {sensor.name}
                                    </MenuItem>
                                ))}
                                </Select>
                                <FormHelperText>What does this sensor monitor?</FormHelperText>
                            </FormControl>
                            {
                                sensorTypes.includes(AIRTHINGS_WAVEPLUS) && (
                                    <Box sx={{ mt: 3}}>
                                        <hr />
                                        <Box sx={{ mt: 1}}>
                                            <Box sx={{ fontSize: 14, mb: 1 }}>
                                                Create a <a href="https://developer.airthings.com/docs/api-getting-started/index.html" target="_blank" rel="noreferrer">new API client</a> following the Airthings documentation and provide the following fields for the Health Platform to automatically begin retrieving data.
                                            </Box>
                                            <TextField
                                                required
                                                label="Client ID"
                                                value={clientKey}
                                                onChange={(e) => {
                                                    setClientKey(e.target.value);
                                                }}
                                            />
                                            <TextField
                                                required
                                                label="Secret Key"
                                                value={clientSecretKey}
                                                onChange={(e) => {
                                                    setClientSecretKey(e.target.value);
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                )
                            }
                        </Box>
                    ) : (
                        <TableContainer component={Paper}>
                            {
                                loading ? (
                                    <>Loading...</>
                                ) : (
                                    <Table aria-label="caption table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Sensor ID</TableCell>
                                                <TableCell>Monitors</TableCell>
                                                <TableCell align="right">
                                                    <Button onClick={() => setShowCreate(true)} variant="outlined" size="small">Add Sensor</Button>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {items.length === 0 ? (
                                                <p style={{paddingLeft: 16}}>No sensors found</p>
                                            ) : (
                                                <>
                                                    {items.map((row) => (
                                                        <TableRow key={row.sensor_id}>
                                                            <TableCell component="th" scope="row">
                                                                {row.sensor_id}
                                                            </TableCell>
                                                            <TableCell>{row.sensor_types?.join(", ")}</TableCell>
                                                            <TableCell>
                                                                <Button variant="text" size="small" onClick={() => handleRemoveSensor(row.sensor_id!)}>Remove Sensor</Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </>
                                            )}
                                        </TableBody>
                                    </Table>
                                )
                            }
                        </TableContainer>
                    )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    {showCreate ? (
                        <Button onClick={handleAddSensor}>Add</Button>
                    ) : (
                        <Button onClick={handleSave}>Save</Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ManageSensors;

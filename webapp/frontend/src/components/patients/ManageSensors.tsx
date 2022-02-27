import { useState } from "react";
import { Box } from "@mui/system";
import {
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    DialogContentText,
    TextField,
    Button,
    TableContainer,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { API } from "aws-amplify";
import { createEventDetail } from "../../common/graphql/mutations";
import { EventDetailInput, SensorsDetail } from "../../common/types/API";
import { DateTimePicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { getSensorsDetail, getSensorsDetailByUser } from "../../common/graphql/queries";
const { v4: uuidv4 } = require('uuid');


export const ManageSensors = (props: { patientId: string }) => {
    const [items, updateItems] = useState<Array<SensorsDetail>>(new Array<SensorsDetail>());
    const [loading, setLoading] = useState<boolean>(true);
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => {
        callListAllSensors();
        setOpen(true);
    };

    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [medication, setMedication] = useState("");
    const [mood, setMood] = useState("");
    const [food, setFood] = useState("");
    const [notes, setNotes] = useState("");

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

    const handleCreateRequest = async () => {
        setOpen(true);

        console.log(start, end, medication, mood, food, notes);

        const eventDetail: EventDetailInput = {
            event_id: uuidv4(),
            user_id: props.patientId,
            start_date_time: start,
            end_date_time: end,
            medication: medication,
            mood: mood,
            food: food,
            notes: notes
        };
        console.log("createEventDetail request:", eventDetail);

        try {
            const response: any = await API.graphql({
                query: createEventDetail,
                variables: { input: eventDetail },
            });
            console.log("createEventDetail response:", response);

            setOpen(false);

        } catch (e) {
            console.log("createEventDetail errors:", e);
        }
    };

    return (
        <>
            <Button variant="text" onClick={handleOpen}>
                Manage Sensors
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Manage Sensors</DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper}>
                        {
                            loading ? (
                                <>Loading...</>
                            ) : items.length === 0 ? (
                                <>No patients found</>
                            ) : (
                                <Table aria-label="caption table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Sensor ID</TableCell>
                                            <TableCell>Sensors</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((row) => (
                                            <TableRow key={row.sensor_id}>
                                                <TableCell component="th" scope="row">
                                                    {row.sensor_id}
                                                </TableCell>
                                                <TableCell>{row.sensor_types?.join(", ")}</TableCell>
                                                <TableCell>
                                                    <Button variant="text">Remove Sensor</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )
                        }
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleCreateRequest}>Create</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ManageSensors;

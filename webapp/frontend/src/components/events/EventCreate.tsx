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
} from "@mui/material";
import { API } from "aws-amplify";
import { createEventDetail } from "../../common/graphql/mutations";
import { EventDetailInput } from "../../common/types/API";
import { DateTimePicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
const { v4: uuidv4 } = require('uuid');


export const EventCreate = (props: { userName: string; disabled: any }) => {
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);

    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [medication, setMedication] = useState("");
    const [mood, setMood] = useState("");
    const [food, setFood] = useState("");
    const [notes, setNotes] = useState("");

    const handleCreateRequest = async () => {
        setOpen(true);

        console.log(start, end, medication, mood, food, notes);

        const eventDetail: EventDetailInput = {
            event_id: uuidv4(),
            user_id: props.userName,
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
        <div>
            <Button variant="outlined" onClick={handleOpen}>
                Create Event
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Event Detail</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please provide details on the event.
                    </DialogContentText>
                    <Box
                        component="form"
                        noValidate
                        autoComplete="off"
                    >
                        <Box
                            sx={{
                                "& .MuiTextField-root": { m: 1, width: "25ch" },
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    label="Start Time"
                                    value={start}
                                    onChange={(value: any) => setStart(value)}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    label="End Time"
                                    value={end}
                                    onChange={(value: any) => setEnd(value)}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Box
                            sx={{
                                "& .MuiTextField-root": { marginBottom: 1, width: "100%" },
                            }}
                        >
                            <TextField
                                required
                                id="filled-required"
                                label="Medication"
                                variant="filled"
                                value={medication}
                                onChange={(e) => {
                                    setMedication(e.target.value);
                                }}
                            />
                            <TextField
                                id="filled-read-only-input"
                                label="Mood"
                                variant="filled"
                                value={mood}
                                onChange={(e) => {
                                    setMood(e.target.value);
                                }}
                            />
                            <TextField
                                id="filled-search"
                                label="Food"
                                variant="filled"
                                value={food}
                                onChange={(e) => {
                                    setFood(e.target.value);
                                }}
                            />
                            <TextField
                                id="filled-helperText"
                                label="Additional Notes"
                                variant="filled"
                                multiline
                                rows={8}
                                value={notes}
                                onChange={(e) => {
                                    setNotes(e.target.value);
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleCreateRequest}>Create</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default EventCreate;

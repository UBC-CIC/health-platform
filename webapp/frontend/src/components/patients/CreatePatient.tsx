import {
    Button, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, TextField
} from "@mui/material";
import { Box } from "@mui/system";
import { API } from "aws-amplify";
import { useState } from "react";
import { createPatientsDetail, updateUsersDetail } from "../../common/graphql/mutations";
import { UsersDetail } from "../../common/types/API";
const { v4: uuidv4 } = require('uuid');

export const CreatePatient = (props: { user: UsersDetail }) => {

    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => {
        setOpen(true);
    };

    const [patientName, setPatientName] = useState("");

    const handleSave = async () => {
        try {
            const patientId = uuidv4();

            const response: any = await API.graphql({
                query: createPatientsDetail,
                variables: { 
                    input: {
                        patient_id: patientId,
                        name: patientName,
                        sensor_types: [],
                        user_ids: [],
                    }
                },
            });
            console.log("createPatientsDetail response:", response);

            const userResponse: any = await API.graphql({
                query: updateUsersDetail,
                variables: { 
                    input: {
                        ...props.user,
                        patient_ids: props.user.patient_ids ? [...props.user.patient_ids, patientId] : [patientId]
                    }
                },
            });
            console.log("updateUsersDetail response:", userResponse);
        } catch (e) {
            console.log("createPatientsDetail errors:", e);
        }

        // TODO: Update table to avoid reloading page
        window.location.reload();
    };

    return (
        <>
            <Button variant="outlined" onClick={handleOpen}>
                Add Patient
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Patient</DialogTitle>
                <DialogContent>
                    <Box
                        style={{ marginTop: 8, marginBottom: 0, width: "480px" }}
                    >
                        <FormControl fullWidth variant="standard">
                            <TextField
                                required
                                label="Patient Name"
                                value={patientName}
                                onChange={(e) => {
                                    setPatientName(e.target.value);
                                }}
                            />
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CreatePatient;

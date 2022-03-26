import {
    Button, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, TextField
} from "@mui/material";
import { Box } from "@mui/system";
import { API } from "aws-amplify";
import { useState } from "react";
import { deletePatientsDetail, updatePatientsDetail, updateUsersDetail } from "../../common/graphql/mutations";
import { PatientsDetail, UsersDetail } from "../../common/types/API";

export const EditPatient = (props: { patientId: string, patient: PatientsDetail, user: UsersDetail }) => {

    const [open, setOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => {
        setDeleteConfirm(false);
        setOpen(true);
    };

    const [patientName, setPatientName] = useState(props.patient.name);

    const handleDelete = async () => {
        try {
            const response: any = await API.graphql({
                query: deletePatientsDetail,
                variables: { 
                    input: {
                        patient_id: props.patient.patient_id,
                    }
                },
            });
            console.log("updatePatientsDetail response:", response);

            if (props.patient.user_ids) {
                for (const userId of props.patient.user_ids) {
                    const userResponse: any = await API.graphql({
                        query: updateUsersDetail,
                        variables: { 
                            input: {
                                ...props.user,
                                patient_ids: props.user.patient_ids ? [...props.user.patient_ids.filter(v => v !== props.patient.patient_id)] : [],
                            }
                        },
                    });
                    console.log("userResponse response:", userResponse);
                }
            }
        } catch (e) {
            console.log("updatePatientsDetail errors:", e);
        }

        // TODO: Update table to avoid reloading page
        window.location.reload();
    };

    const handleSave = async () => {
        try {
            const response: any = await API.graphql({
                query: updatePatientsDetail,
                variables: { 
                    input: {
                        ...props.patient,
                        name: patientName,
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

    return (
        <>
            <Button variant="text" size="small" onClick={handleOpen}>
                Edit Patient
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit Patient Details</DialogTitle>
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

                         <FormControl fullWidth sx={{ mt: 3 }} variant="standard">
                            <TextField
                                disabled
                                label="Patient ID"
                                value={props.patient.patient_id}
                            />
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions style={{marginLeft: 8}}>
                    {/* {
                        deleteConfirm ? (
                            <>
                                Confirm dissociation? <Button variant="text" color="error" onClick={handleDelete}>Yes</Button>
                            </>
                        ) : (
                            <Button variant="text" color="error" onClick={() => setDeleteConfirm(true)}>Dissociate Patient</Button>
                        )
                    } */}
                    <div style={{flex: '1 0 0'}} />
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditPatient;

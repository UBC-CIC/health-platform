
import {
    Button, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, TextField
} from "@mui/material";
import { Box } from "@mui/system";
import { API } from "aws-amplify";
import { useState } from "react";
import { deletePatientsDetail, updatePatientsDetail, updateUsersDetail } from "../../common/graphql/mutations";
import { getMessage } from "../../common/graphql/queries";
import { PatientsDetail, UsersDetail } from "../../common/types/API";


export const DownloadData = (props: { patientId: string, patient: PatientsDetail, user: UsersDetail }) => {

    const [open, setOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => {
        setDeleteConfirm(false);
        setOpen(true);
    };

    const [patientName, setPatientName] = useState(props.patient.name);


    const handleDownload = async () => {
        try {
            const response: any = await API.graphql({
                query: getMessage,
                variables: { 
                        patientId: props.patient.patient_id,
                    }
                });
                console.log(response)
                // console.log(response)
                // var a = document.createElement("a");
                // a.href = response;
                // a.setAttribute("download", response);
                // a.click();
                
        } catch (e) {
            console.log("updatePatientsDetail errors:", e);
        }

        // TODO: Update table to avoid reloading page
    };

    return (
        <>
            <Button variant="text" size="small" onClick={handleOpen}>
                Export Data
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Would you like to export {patientName}'s data?</DialogTitle>
                <DialogContent>
                    <Button onClick = {() => handleDownload()}> Download File</Button>
                </DialogContent>

                {/* <DialogContent>
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
                </DialogContent> */}
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
                    {/* <Button onClick={handleSave}>Proceed</Button>
                    <Button onClick={handleClose}>Cancel</Button> */}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DownloadData;

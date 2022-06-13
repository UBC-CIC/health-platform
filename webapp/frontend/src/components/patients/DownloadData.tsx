import {
    Button, CircularProgress, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, TextField
} from "@mui/material";
import { Box } from "@mui/system";
import { API } from "aws-amplify";
import { useState } from "react";
import { deletePatientsDetail, updatePatientsDetail, updateUsersDetail } from "../../common/graphql/mutations";
import { getMessage } from "../../common/graphql/queries";
import { PatientsDetail, UsersDetail } from "../../common/types/API";


export const DownloadData = (props: { patientId: string, patient: PatientsDetail, user: UsersDetail }) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => {
        setDeleteConfirm(false);
        setOpen(true);
    };

    const [patientName, setPatientName] = useState(props.patient.name);
    
    const handleDownload = async () => {
        setLoading(true);

        // Query backend to recieve downloadable URL link
        try {
            const response: any = await API.graphql({
                query: getMessage,
                variables: { 
                        patientId: props.patient.patient_id,
                    }
            })
                const dataLink = response["data"]["getMessage"]["data"];
                console.log("Fetching patient data");
                console.log(response);
                console.log(dataLink);
                setLoading(false);
                
                // Creats an element that allows download to begin on click
                var link = document.createElement("a");
                link.download = dataLink;
                link.href = dataLink;
                link.click();

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
                    <div> 
                        {loading ? <CircularProgress/>  : ''}
                    </div>

                    <Button onClick = {handleDownload}> Download File </Button>
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogContent>
                <DialogActions style={{marginLeft: 8}}>
               
                    <div style={{flex: '1 0 0'}} />
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DownloadData;


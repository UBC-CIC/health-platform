import {
    Button, CircularProgress, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, LinearProgress, TextField,
} from "@mui/material";
import { DateTimePicker, LoadingButton, LocalizationProvider } from '@mui/lab';
import { Box } from "@mui/system";
import { API } from "aws-amplify";
import { useState } from "react";
import { deletePatientsDetail, updatePatientsDetail, updateUsersDetail } from "../../common/graphql/mutations";
import { getMessage } from "../../common/graphql/queries";
import { PatientsDetail, UsersDetail } from "../../common/types/API";
import AdapterDateFns from '@mui/lab/AdapterDateFns';


export const DownloadData = (props: { patientId: string, patient: PatientsDetail, user: UsersDetail }) => {
    const [selectedStartDate, setSelectedStartDate] = useState< Date | null  >(null)
    const [selectedEndDate, setSelectedEndDate] = useState< Date | null  >(null)
    const [showCreate, setShowCreate] = useState(false)
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const handleClose = () => {
        setOpen(false);
        setShowCreate(false);}
    const handleOpen = () => {
        setDeleteConfirm(false);
        setOpen(true);
    };

    const [patientName, setPatientName] = useState(props.patient.name);
    // console.log("startDate", selectedStartDate?.toISOString())
    // console.log("endDate", selectedEndDate?.toISOString())

    const handleDownload = async (eventTypeInput: String) => {
        setLoading(true);
        try {
            const response: any = await API.graphql({
                query: getMessage,
                variables: { 
                        patientId: props.patient.patient_id,
                        eventType: eventTypeInput
                        // startDate: selectedStartDate?.toISOString(),
                        // endDate: selectedEndDate?.toISOString(),
                    }
            })
                const dataLink = response["data"]["getMessage"]["data"];
                console.log("Fetching patient data", response, dataLink);
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
    const handleBack = () => {
        setShowCreate(false)
    }
    
    return (
        <>
            <Button variant="text" size="small" onClick={handleOpen}>
                Export Data
            </Button>
            <Dialog open={open} onClose={handleClose}>
               
                   
                {/* To Do: implement date range picker w/ error handling */}
                {/* {/* <DialogContent>
                    <div> 
                        {loading ? <CircularProgress/>  : ''}
                    </div>
                    <Box>
                    {showCreate ? (
                    <Box>
                        <DialogTitle>Please select a date range</DialogTitle>
                         <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
                            <DateTimePicker
                                label="Start Time"
                                value={2}
                                onChange={(value: any) => setSelectedStartDate(value)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                        <Box sx={{ mb: 3 }} className="date-time-picker-wrapper">
                            <DateTimePicker
                                label="End Time"
                                value={3}
                                onChange={(value: any) => setSelectedEndDate(value)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                        <DialogActions style={{marginLeft: 8}}>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button onClick={handleBack}>Back</Button>
                                </DialogActions>
                    </LocalizationProvider>
                    </Box>
                    
                    ) : (
                       // Add buttons here
                        
                    )} </Box>
                    </DialogContent> */}
                        <DialogContent>

                        {loading ? 
                        <Box>
                        <DialogTitle>Fetching Patient Data ...</DialogTitle>
                        <LinearProgress/> 
                        </Box>
                        : (
                        <Box>
                        <DialogTitle>What type of data would you like to export?</DialogTitle>
                        <Button onClick={() => handleDownload("sensor-data")} fullWidth={true} variant="outlined" size="large"> Download Patient Sensor Data </Button> 
                               <div style={{flex: '1 0 0'}} />
                               <Button onClick={() => handleDownload("event-data")} fullWidth={true} variant="outlined" size="large" sx={{ mt: 1 }}> Download Patient Event Data </Button>
                               
                           <DialogActions style={{marginLeft: 8}}>
                           <Button onClick={handleClose}>Cancel</Button>
                           </DialogActions>
                        </Box>)}
                        </DialogContent>
                        
                    </Dialog> 
                </>
       
    );
};

export default DownloadData;


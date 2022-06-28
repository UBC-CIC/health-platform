import {
    Button, CircularProgress, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, LinearProgress, ListItem, MenuItem, TextField, Checkbox
} from "@mui/material";
import { DateRangePicker, DateRange, LoadingButton, LocalizationProvider } from '@mui/lab';
import { Box } from "@mui/system";
import { API } from "aws-amplify";
import { Fragment, useState } from "react";
import { deletePatientsDetail, updatePatientsDetail, updateUsersDetail } from "../../common/graphql/mutations";
import { getMessage } from "../../common/graphql/queries";
import { PatientsDetail, UsersDetail } from "../../common/types/API";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { string } from "yup/lib/locale";
import { setSyntheticLeadingComments } from "typescript";
import { faLessThanEqual } from "@fortawesome/free-solid-svg-icons";


export const DownloadData = (props: { patientId: string, patient: PatientsDetail, user: UsersDetail }) => {
    const [patientDataVal, setPatientDataVal] = useState(false)
    const [error, setError] = useState(false)
    const [showDateRange, setShowDateRange] = useState(false);
    // const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
    const [value, setValue] = useState<DateRange<Date>>([null, null]);
    // const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
    const [showCreate, setShowCreate] = useState(false)
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const handleClose = () => {
        setOpen(false);
        setShowCreate(false);
        setError(false);
        setPatientDataVal(false);

    }
    const handleOpen = () => {
        setDeleteConfirm(false);
        setOpen(true);
        setShowDateRange(false)
    };

    const [patientName, setPatientName] = useState(props.patient.name);
    
    const handleDateDownload = async () => {
       const [start, end] = [...value]
       console.log(start?.toISOString, end?.toISOString)
    }

    const handleDownload = async (eventTypeInput: String) => {
        const [start, end] = [...value]
        
        console.log(start?.toISOString(), end?.toISOString());
        setLoading(true);
        setShowCreate(false);
        console.log(eventTypeInput)
        try {
            const response: any = await API.graphql({
                query: getMessage,
                variables: { 
                        patientId: props.patient.patient_id,
                        eventType: eventTypeInput,
                        startDate: start?.toISOString(),
                        endDate: end?.toISOString(),
                    }
            })
                const dataLink = response["data"]["getMessage"]["data"];
                console.log("Fetching patient data", response, dataLink);
                
                if (dataLink == 'Patient data does not exist'){
                    setError(true)
                    setLoading(false);
                } else {
                    setLoading(false);
                // Creats an element that allows download to begin on click
                var link = document.createElement("a");
                link.download = dataLink;
                link.href = dataLink;
                link.click();
                }
                
        } catch (e) {
            console.log("updatePatientsDetail errors:", e);
        }
      
        // TODO: Update table to avoid reloading page
    };
    
    const handleBack = () => {
        setShowCreate(false)
        setShowDateRange(false)
        setPatientDataVal(false)
    }

    return (
        <>
            <Button variant="text" size="small" onClick={handleOpen}>
                Export Data
            </Button>

            <Dialog open={open} fullWidth onClose={handleClose}>

                {/* To Do: implement date range picker w/ error handling */}

                <DialogContent>
                    <Box>
                        {showCreate ? (
                            <Box>
                                <DialogContent>
                                    <Button onClick={() => {patientDataVal ? 
                                        handleDownload('event-data-all') : handleDownload('sensor-data-all')}} 
                                        fullWidth={true} disabled = {showDateRange}  variant="outlined" size="large">
                                        Download All Data
                                    </Button>
                                    
                                    <Button onClick={() => {
                                        setShowDateRange(true)
                                        
                                        
                                    } } fullWidth={true} variant="outlined" size="large" sx={{ mt: 1 }} >
                                        Select a date range
                                    </Button>
                                    </DialogContent>
                                    {showDateRange ? (
                                        <Box>
                                            <DialogTitle sx={{ pl: 11}}> Please select a valid date range
                                            </DialogTitle>
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <Box sx={{ mb: 3, pl:8 }} className="date-time-picker-wrapper">
                                                <DateRangePicker

                                                        value={value}
                                                        onChange={(value: any) => {
                                                        setValue(value);
                                                        }}
                                                        renderInput={(startProps, endProps) => (
                                                        <Fragment>
                                                            <TextField {...startProps} />
                                                            <Box sx={{ mx: 2 }}> to </Box>
                                                            <TextField {...endProps} />
                                                        </Fragment>
                                                        )}
                                                    />
                                                </Box>
                                               
                                            </LocalizationProvider>
                                             <Button onClick={() => {patientDataVal ? 
                                            handleDownload('event-data-range') : handleDownload('sensor-data-range')}}  
                                            disabled = {value == null} sx={{ mb: 3, marginLeft: 8 }}>
                                                Download
                                            </Button>
                                          
                                        </Box>
                                    ) : ''}
                            

                                <DialogActions style={{ marginLeft: 8 }}>
                                    <Button onClick={handleClose}>Cancel</Button>
                                    <Button onClick={handleBack}>Back</Button>
                                </DialogActions>
                            </Box>


                        ) : (
                            <DialogContent>

                                {loading ?
                                    <Box>
                                       
                                            <Box>
                                            <DialogTitle> Fetching Patient Data ... </DialogTitle>
                                            <LinearProgress />
                                            </Box>
                                            
                                        
                                      
                                       
                                    </Box>
                                    : ( 
                                        <Box>
                                            {error ?  
                                            
                                         (   <Box>
                                            <DialogTitle> Error: Patient Data not found </DialogTitle>
                                            <DialogActions style={{ marginLeft: 8 }}>
                                                <Button onClick={handleClose}>Cancel</Button>
                                            </DialogActions> 
                                            
                                            </Box> )
                                            : 

                                            (<Box>
                                            <DialogTitle>What type of data would you like to export?</DialogTitle>
                                            <Button onClick={() => setShowCreate(true)} fullWidth={true} variant="outlined" size="large"> Download Patient Sensor Data </Button>
                                            <div style={{ flex: '1 0 0' }} />
                                            <Button onClick={() => {setShowCreate(true); setPatientDataVal(true)}} fullWidth={true} variant="outlined" size="large" sx={{ mt: 1 }}> Download Patient Event Data </Button>

                                            <DialogActions style={{ marginLeft: 8 }}>
                                                <Button onClick={handleClose}>Cancel</Button>
                                            </DialogActions> 
                                            </Box>)}
                                        </Box>)}
                            </DialogContent>
                        )} </Box>
                </DialogContent>
            </Dialog>
        </>

    );
};

export default DownloadData;


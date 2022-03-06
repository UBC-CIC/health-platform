import {
    Button, Dialog,
    DialogActions, DialogContent, DialogTitle, TableContainer, TextField
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
import { createPatientsDetail, deletePatientsDetail, updateUsersDetail } from "../../common/graphql/mutations";
import { getPatientsDetail, getUsersDetail } from "../../common/graphql/queries";
import { PatientsDetail, UsersDetail } from "../../common/types/API";
import { ManageSensors } from "../patients/ManageSensors";
const { v4: uuidv4 } = require('uuid');

export const ManagePatients = (props: { user: UsersDetail }) => {
    const theme = useTheme();

    const [items, updateItems] = useState<Array<PatientsDetail>>(new Array<PatientsDetail>());
    const [patientsToRemove, setPatientsToRemove] = useState<Array<PatientsDetail>>(new Array<PatientsDetail>());
    const [patientsToAdd, setPatientsToAdd] = useState<Array<PatientsDetail>>(new Array<PatientsDetail>());
    const [loading, setLoading] = useState<boolean>(true);
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => {
        callListAllPatients();
        setOpen(true);
    };

    const [showCreate, setShowCreate] = useState(false);
    const [patientName, setPatientName] = useState("");

    async function callListAllPatients() {
        try {
            const patientDetails: Array<PatientsDetail> = [];
            for (const patientId of props.user.patient_ids!) {
                console.log("Looking for patient ", patientId)
                try {
                    const response: any = await API.graphql({
                        query: getPatientsDetail,
                        variables: {
                            patientId: patientId,
                        },
                    });
                    console.log("getPatientsDetail response:", response);
                    const patientDetail: PatientsDetail = response["data"]["getPatientsDetail"];
                    patientDetails.push(patientDetail);
                } catch (e) {
                    console.log("getPatientsDetail errors:", e);
                }
            }

            setLoading(false);
            updateItems(patientDetails);
        } catch (e) {
            setLoading(false);
            console.log('getPatientsDetail errors:', e);
        }
    }

    const handleAddPatient = () => {
        if (patientName !== "") {
            const newPatientDetail: PatientsDetail = {
                __typename: "PatientsDetail",
                patient_id: uuidv4(),
                name: patientName,
            };
            setPatientsToAdd([
                ...patientsToAdd,
                newPatientDetail,
            ]);
            updateItems([
                ...items,
                newPatientDetail,
            ]);
            setShowCreate(false);
        }
    };

    const handleRemovePatient = (patientId: string) => {
        if (patientId !== "") {
            const found = items.find(i => i.patient_id === patientId);
            if (found) {
                setPatientsToRemove([
                    ...patientsToRemove,
                    found,
                ]);
                setPatientsToAdd([
                    ...patientsToAdd.filter(i => i.patient_id !== patientId),
                ]);
                updateItems([
                    ...items.filter(i => i.patient_id !== patientId),
                ]);
            }
            setShowCreate(false);
        }
    };

    const handleSave = async () => {
        if (patientsToRemove.length > 0) {
            for (const patientToRemove of patientsToRemove) {
                console.log("Removing patient " + JSON.stringify(patientToRemove));
                try {
                    const response: any = await API.graphql({
                        query: deletePatientsDetail,
                        variables: {
                            input: {
                                patient_id: patientToRemove.patient_id,
                            }
                        },
                    });

                    const userResponse: any = await API.graphql({
                        query: updateUsersDetail,
                        variables: { 
                            input: {
                                ...props.user,
                                patient_ids: props.user.patient_ids ? [...props.user.patient_ids.filter(v => v !== patientToRemove.patient_id)] : [],
                            }
                        },
                    });
                    console.log("userResponse response:", userResponse);
                    
                    console.log("deletePatientsDetail response:", response);
                } catch (e) {
                    console.log("deletePatientsDetail errors:", e);
                }
            }
        }
        if (patientsToAdd.length > 0) {
            for (const patientToAdd of patientsToAdd) {
                console.log("Adding patient " + JSON.stringify(patientToAdd));
                try {
                    const response: any = await API.graphql({
                        query: createPatientsDetail,
                        variables: { 
                            input: {
                                name: patientToAdd.name,
                                patient_id: patientToAdd.patient_id,
                                sensor_types: patientToAdd.sensor_types,
                                user_ids: [props.user.user_id],
                            }
                        },
                    });
                    console.log("createPatientsDetail response:", response);
                } catch (e) {
                    console.log("createPatientsDetail errors:", e);
                }
            }
        }

        // TODO: Update table to avoid reloading page
        window.location.reload();
    };

    return (
        <>
            <Button variant="text" onClick={handleOpen}>
                Manage Patients
            </Button>
            <Dialog open={open} onClose={handleClose}>
                {
                    showCreate ? (
                        <DialogTitle>Add New Patient</DialogTitle>
                    ) : (
                        <DialogTitle>Manage Patients</DialogTitle>
                    )
                }
                <DialogContent>
                    <Box
                        style={{ marginTop: 8, marginBottom: 0, width: "480px" }}
                    >

                    {showCreate ? (
                        <Box
                            sx={{
                                "& .MuiTextField-root": { marginBottom: 1, width: "100%" },
                            }}
                        >
                            <TextField
                                required
                                label="Patient Name"
                                value={patientName}
                                onChange={(e) => {
                                    setPatientName(e.target.value);
                                }}
                            />
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
                                                <TableCell>Patient ID</TableCell>
                                                <TableCell>Patient Name</TableCell>
                                                <TableCell align="right">
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {items.length === 0 ? (
                                                <p style={{paddingLeft: 16}}>No patients found</p>
                                            ) : (
                                                <>
                                                    {items.map((row) => (
                                                        <TableRow key={row.patient_id}>
                                                            <TableCell component="th" scope="row">
                                                                {row.patient_id}
                                                            </TableCell>
                                                            <TableCell>{row.name}</TableCell>
                                                            <TableCell>
                                                                <ManageSensors patientId={row.patient_id!} patient={row} />
                                                                <Button variant="text" onClick={() => handleRemovePatient(row.patient_id!)}>Dissociate Patient</Button>
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
                        <Button onClick={handleAddPatient}>Add</Button>
                    ) : (
                        <Button onClick={handleSave}>Save</Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ManagePatients;

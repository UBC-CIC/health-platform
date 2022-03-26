import {
    Button, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TableContainer
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
import { updatePatientsDetail, updateUsersDetail } from "../../common/graphql/mutations";
import { getUsersDetail, listUsersDetails } from "../../common/graphql/queries";
import { PatientsDetail, UsersDetail } from "../../common/types/API";
const { v4: uuidv4 } = require('uuid');

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;


export const ManageUsers = (props: { patient: PatientsDetail }) => {
    const theme = useTheme();

    const [caregivers, updateCaregivers] = useState<Array<UsersDetail>>(new Array<UsersDetail>());
    const [caregiversForPatient, updateCaregiversForPatient] = useState<Array<UsersDetail>>(new Array<UsersDetail>());
    const [usersToRemove, setUsersToRemove] = useState<Array<UsersDetail>>(new Array<UsersDetail>());
    const [usersToAdd, setUsersToAdd] = useState<Array<UsersDetail>>(new Array<UsersDetail>());
    const [loading, setLoading] = useState<boolean>(true);
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => {
        callListAllCaregivers();
        callListCaregiversForPatient();
        setOpen(true);
    };

    const [showCreate, setShowCreate] = useState(false);
    const [userId, setUserId] = useState("");

    async function callListCaregiversForPatient() {
        const users: UsersDetail[] = [];
        for (const userId of props.patient.user_ids!) {
            try {
                const response: any = await API.graphql({
                    query: getUsersDetail,
                    variables: {
                        userId: userId,
                    },
                });
                console.log("getUsersDetail response:", response);
                const userDetail: UsersDetail = response["data"]["getUsersDetail"];
                users.push(userDetail);
            } catch (e) {
                setLoading(false);
                console.log('getUsersDetail errors:', e);
            }
        }

        setLoading(false);
        updateCaregiversForPatient(users);
    }

    async function callListAllCaregivers() {
        try {
            const userDetailObj: any = await API.graphql({
                query: listUsersDetails,
                variables: {}
            });
            console.log(userDetailObj);
            const itemsReturned: Array<UsersDetail> = userDetailObj['data']['listUsersDetails']['items'];
            updateCaregivers(itemsReturned);
            setLoading(false);
            console.log('itemsReturned:', itemsReturned);
        } catch (e) {
            setLoading(false);
            console.log('listUsersDetails errors:', e);
        }
    }

    const handleAddCaregiver = () => {
        if (userId !== "" && caregiversForPatient.filter(user => user.user_id === userId).length == 0 && caregivers.filter(user => user.user_id === userId).length > 0) {
            const newUser = caregivers.filter(user => user.user_id === userId)[0];
            setUsersToAdd([
                ...usersToAdd,
                newUser,
            ]);
            updateCaregiversForPatient([
                ...caregiversForPatient,
                newUser,
            ]);
        }
        setShowCreate(false);
    };

    const handleRemoveCaregiver = (userId: string) => {
        if (userId !== "") {
            const found = caregiversForPatient.find(i => i.user_id === userId);
            if (found) {
                setUsersToRemove([
                    ...usersToRemove,
                    found,
                ]);
                setUsersToAdd([
                    ...usersToAdd.filter(i => i.user_id !== userId),
                ]);
                updateCaregiversForPatient([
                    ...caregiversForPatient.filter(i => i.user_id !== userId),
                ]);
            }
            setShowCreate(false);
        }
    };

    const handleSave = async () => {
        let newCaregiverIds = [...props.patient.user_ids!];
        if (usersToRemove.length > 0) {
            for (const userToRemove of usersToRemove) {
                console.log("Dissociating user " + JSON.stringify(userToRemove));
                newCaregiverIds = newCaregiverIds.filter(id => id !== userToRemove.user_id)

                await API.graphql({
                    query: updateUsersDetail,
                    variables: { 
                        input: {
                            ...userToRemove,
                            patient_ids: userToRemove.patient_ids ? [...userToRemove.patient_ids.filter(v => v !== props.patient.patient_id)] : [],
                        }
                    },
                });
            }
        }
        if (usersToAdd.length > 0) {
            for (const userToAdd of usersToAdd) {
                console.log("Adding user " + JSON.stringify(userToAdd));

                // Remove in case of duplicates
                newCaregiverIds = newCaregiverIds.filter(id => id !== userToAdd.user_id)
                newCaregiverIds.push(userToAdd.user_id!)

                await API.graphql({
                    query: updateUsersDetail,
                    variables: { 
                        input: {
                            ...userToAdd,
                            patient_ids: userToAdd.patient_ids ? [...userToAdd.patient_ids, props.patient.patient_id] : [],
                        }
                    },
                });
            }
        }

        try {
            const response: any = await API.graphql({
                query: updatePatientsDetail,
                variables: {
                    input: {
                        ...props.patient,
                        user_ids: newCaregiverIds
                    }
                },
            });
            console.log("updatePatientsDetail response:", response);
        } catch (e) {
            console.log("updatePatientsDetail errors:", e);
        }

        try {

            const response: any = await API.graphql({
                query: updatePatientsDetail,
                variables: {
                    input: {
                        ...props.patient,
                        user_ids: newCaregiverIds
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
                Manage
            </Button>
            <Dialog open={open} onClose={handleClose}
                fullWidth
                maxWidth="xl"
            >
                {
                    showCreate ? (
                        <DialogTitle>Add Caregiver</DialogTitle>
                    ) : (
                        <DialogTitle>Manage Caregivers</DialogTitle>
                    )
                }
                <DialogContent>
                    <Box>

                    {showCreate ? (
                        <Box
                            sx={{
                                "& .MuiTextField-root": { marginBottom: 1, width: "100%" },
                            }}
                        >
                            <FormControl sx={{ width: 600, mt: 2 }}>
                                <InputLabel id="user-type-label">Caregiver</InputLabel>
                                <Select
                                    labelId="user-type-label"
                                    id="user-type"
                                    value={userId}
                                    onChange={(e) => {
                                        setUserId(e.target.value);
                                    }}
                                >
                                {caregivers.map((caregiver) => (
                                    <MenuItem
                                        key={caregiver.user_id}
                                        value={caregiver.user_id}
                                    >
                                        {caregiver.email}
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
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
                                                <TableCell>Caregiver</TableCell>
                                                <TableCell align="right">
                                                    <Button onClick={() => setShowCreate(true)} variant="outlined" size="small">Add Caregiver</Button>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {caregiversForPatient.length === 0 ? (
                                                <p style={{paddingLeft: 16}}>No caregivers found</p>
                                            ) : (
                                                <>
                                                    {caregiversForPatient.map((row) => (
                                                        <TableRow key={row.user_id}>
                                                            <TableCell component="th" scope="row">
                                                                {row.email}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button variant="text" size="small" onClick={() => handleRemoveCaregiver(row.user_id!)}>Remove Caregiver</Button>
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
                        <Button onClick={handleAddCaregiver}>Add</Button>
                    ) : (
                        <Button onClick={handleSave}>Save</Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ManageUsers;

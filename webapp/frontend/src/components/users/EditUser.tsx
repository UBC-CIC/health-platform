import {
    Button, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, OutlinedInput, Select, TextField, useTheme
} from "@mui/material";
import { Box } from "@mui/system";
import { API } from "aws-amplify";
import { useState } from "react";
import { deleteUsersDetail, updateUsersDetail } from "../../common/graphql/mutations";
import { UsersDetail } from "../../common/types/API";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const USER_TYPES = [
    {"name": "ADMIN", "id": "ADMIN"},
    {"name": "CAREGIVER", "id": "CAREGIVER"},
];

function getStyles(name: any, personName: any, theme: any) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
}

export const EditPatient = (props: { numAdmin: number, user: UsersDetail }) => {
    const theme = useTheme();

    const [open, setOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [userType, setUserType] = useState(props.user.user_type);
    const handleClose = () => setOpen(false);
    const handleOpen = () => {
        setDeleteConfirm(false);
        setOpen(true);
    };

    const [userEmail, setUserEmail] = useState(props.user.email);

    const handleDelete = async () => {
        try {
            const response: any = await API.graphql({
                query: deleteUsersDetail,
                variables: { 
                    input: {
                        user_id: props.user.user_id,
                    }
                },
            });
            var AWS = require('aws-sdk');
            console.log(process.env.REACT_APP_IDENTITYPOOLID)
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: process.env.REACT_APP_IDENTITYPOOLID,
                region: "us-west-2",
            });
            var CognitoIdentityServiceProvider = AWS.CognitoIdentityServiceProvider;
            var client = new CognitoIdentityServiceProvider({ apiVersion: '2016-04-19', region: 'us-west-2' });
            await client.adminDeleteUser({
                UserPoolId: process.env.REACT_APP_USERPOOLID,
                Username: props.user.user_id,
            }).promise();                                                                                                                               
            console.log("deleteUsersDetail response:", response);
        } catch (e) {
            console.log("updateUsersDetail errors:", e);
        }
        
        // TODO: Update table to avoid reloading page
        window.location.reload();
    };

    const handleSave = async () => {
        try {
            const user = {
                ...props.user,
                user_type: userType,
            }

            const response: any = await API.graphql({
                query: updateUsersDetail,
                variables: {
                    input: user,
                },
            });
            console.log("updateUsersDetail response:", response);
        } catch (e) {
            console.log("updateUsersDetail errors:", e);
        }

        // TODO: Update table to avoid reloading page
        window.location.reload();
    };

    return (
        <>
            <Button variant="text" onClick={handleOpen}>
                Edit User
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit User Details</DialogTitle>
                <DialogContent>
                    <Box
                        style={{ marginTop: 8, marginBottom: 0, width: "480px" }}
                    >
                        <FormControl fullWidth variant="standard">
                            <TextField
                                disabled
                                label="Email"
                                value={props.user.email}
                            />
                        </FormControl>

                         <FormControl fullWidth sx={{ mt: 3 }} variant="standard">
                            <TextField
                                disabled
                                label="User ID"
                                value={props.user.user_id}
                            />
                        </FormControl>

                        <FormControl sx={{ width: 480, mt: 3 }}>
                            <InputLabel id="sensor-type-label">Types</InputLabel>
                            <Select
                                labelId="sensor-type-label"
                                id="sensor-type-label"
                                value={userType}
                                onChange={(e) => {
                                    setUserType(e.target.value);
                                }}
                                input={<OutlinedInput label="Name" />}
                                MenuProps={MenuProps}
                            >
                                {USER_TYPES.map((t) => (
                                    <MenuItem
                                        key={t.id}
                                        value={t.id}
                                        style={getStyles(t.id, userType, theme)}
                                    >
                                        {t.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions style={{marginLeft: 8}}>
                    {
                        (props.user.user_type === "ADMIN" && props.numAdmin <= 1) ? (
                            <small>At least one ADMIN user must remain to delete this user</small>
                        ) : deleteConfirm ? (
                            <>
                                Confirm deletion? <Button variant="text" color="error" onClick={handleDelete}>Yes</Button>
                            </>
                        ) : (
                            <Button variant="text" color="error" onClick={() => setDeleteConfirm(true)}>Delete User</Button>
                        )
                    }
                    <div style={{flex: '1 0 0'}} />
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditPatient;

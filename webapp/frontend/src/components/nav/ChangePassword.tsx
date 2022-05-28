import {
    Alert,
    Button, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, TextField
} from "@mui/material";
import { Box } from "@mui/system";
import { Auth } from 'aws-amplify';
import { useState } from "react";

export const ChangePassword = (props: {open: boolean, setOpen: any}) => {

    const handleClose = () => props.setOpen(false);
    const handleOpen = () => {
        props.setOpen(true);
    };

    const [existingPassword, setExistingPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSave = async () => {
        Auth.currentAuthenticatedUser()
            .then((user: any) => {
                return Auth.changePassword(user, existingPassword, newPassword);
            })
            .then(data => {
                setErrorMessage("");
                setSuccessMessage("Password Changed Successfully");
            })
            .catch(err => {
                setErrorMessage(err.message);
                setSuccessMessage("");
            });
    };

    return (
        <>
            <Button variant="outlined" onClick={handleOpen}>
                Change Password
            </Button>
            <Dialog open={props.open} onClose={handleClose}>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    {successMessage !== "" && 
                        <Alert severity="success">{successMessage}</Alert>
                    }
                    {errorMessage !== "" && 
                        <Alert severity="error">{errorMessage}</Alert>
                    }
                    <Box
                        style={{ marginTop: 8, marginBottom: 0, width: "480px" }}
                        sx={{
                          '& .MuiTextField-root': { m: 1 },
                        }}
                    >
                        <FormControl fullWidth variant="standard">
                            <TextField
                                required
                                label="Existing Password"
                                value={existingPassword}
                                type="password"
                                onChange={(e) => {
                                    setExistingPassword(e.target.value);
                                }}
                            />
                            <TextField
                                required
                                label="New Password"
                                value={newPassword}
                                type="password"
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                }}
                            />
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ChangePassword;

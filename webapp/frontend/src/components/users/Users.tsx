import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import { API } from "aws-amplify";
import { useEffect, useRef, useState } from "react";
import { listUsersDetails } from "../../common/graphql/queries";
import { UsersDetail } from "../../common/types/API";
import CreateUser from "./CreateUser";
import EditUser from "./EditUser";
import ManagePatients from "./ManagePatients";
import "./users.css";


export const Users = (props: { userName: any, userId: any }) => {
    const [items, updateItems] = useState<Array<UsersDetail>>(new Array<UsersDetail>());
    const [loading, setLoading] = useState<boolean>(true);
    const stateRef = useRef<Array<UsersDetail>>();
    stateRef.current = items;

    useEffect(() => {
        async function callListAllEvents() {
            try {
                const userDetailObj: any = await API.graphql({
                    query: listUsersDetails,
                    variables: {}
                });
                console.log(userDetailObj);
                const itemsReturned: Array<UsersDetail> = userDetailObj['data']['listUsersDetails']['items'];
                updateItems(itemsReturned);

                // // Get the patients that this user cares for
                // const patientDetails: Array<PatientsDetail> = [];
                // if (userDetail.patient_ids) {
                //     for (const patient_id of userDetail.patient_ids) {
                //         const patientDetailObj: any = await API.graphql({
                //             query: getPatientsDetail,
                //             variables: {
                //                 patientId: patient_id,
                //             }
                //         });
                //         const patientDetail: PatientsDetail = patientDetailObj["data"]["getPatientsDetail"];
                //         patientDetails.push(patientDetail);
                //     }
                // }

                setLoading(false);
                console.log('itemsReturned:', itemsReturned);
            } catch (e) {
                setLoading(false);
                console.log('getUsersDetail errors:', e);
            }
        }

        callListAllEvents()
    }, []);


    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <TableContainer component={Paper}>
                    {
                        loading ? (
                            <>Loading...</>
                        ) : items.length === 0 ? (
                            <>No users found</>
                        ) : (
                            <Table sx={{ minWidth: 650 }} aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Email</TableCell>
                                        <TableCell>User ID</TableCell>
                                        <TableCell>Patient IDs</TableCell>
                                        <TableCell>User Type</TableCell>
                                        <TableCell align="right">
                                            <CreateUser />
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((row) => (
                                        <TableRow key={row.user_id}>
                                            <TableCell component="th" scope="row">
                                                {row.email}
                                            </TableCell>
                                            <TableCell>{row.user_id}</TableCell>
                                            <TableCell>{row.patient_ids?.length} Patients Monitored</TableCell>
                                            <TableCell>{row.user_type}</TableCell>
                                            <TableCell align="right">
                                                <ManagePatients user={row} />
                                                <EditUser user={row} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )
                    }
                </TableContainer>
            </Box>
        </Box>
    );
};

export default Users;

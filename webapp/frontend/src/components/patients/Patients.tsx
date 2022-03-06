import { Button } from "@mui/material";
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
import { getPatientsDetail, getUsersDetail } from "../../common/graphql/queries";
import { onCreatePatientsDetail } from "../../common/graphql/subscriptions";
import { PatientsDetail, UsersDetail } from "../../common/types/API";
import CreatePatient from "./CreatePatient";
import EditPatient from "./EditPatient";
import ManageSensors from "./ManageSensors";

import "./patients.css";

export const Patients = (props: { userName: any, userId: any }) => {
    const [items, updateItems] = useState<Array<PatientsDetail>>(new Array<PatientsDetail>());
    const [user, setUser] = useState<UsersDetail>({} as UsersDetail);
    const [loading, setLoading] = useState<boolean>(true);
    const stateRef = useRef<Array<PatientsDetail>>();
    stateRef.current = items;

    useEffect(() => {

        async function subscribeCreateEvents() {
            const subscription: any = API.graphql({
                query: onCreatePatientsDetail
            });

            subscription.subscribe({
                next: (data: any) => {
                    console.log("data received from create subscription:", data);
                    const newItems = [];
                    let found = false;
                    if (data.value.data) {
                        for (let item of stateRef.current!) {
                            if (data.value.data.onCreatePatientsDetail.patientId === item.patient_id) {
                                // Found existing item so we will update this item
                                newItems.push(data.value.data.onCreatePatientsDetail);
                                found = true;
                            } else {
                                // Keep existing item
                                newItems.push(item);
                            }
                        }
                        if (!found) {
                            newItems.push(data.value.data.onCreatePatientsDetail);
                        }
                        updateItems(newItems);
                    }
                },
                error: (error: any) => console.warn(error)
            });
        };

        async function callListAllEvents() {
            try {
                const userDetailObj: any = await API.graphql({
                    query: getUsersDetail,
                    variables: {
                        userId: props.userId,
                    }
                });
                console.log(userDetailObj);
                const userDetail: UsersDetail = userDetailObj['data']['getUsersDetail'];
                setUser(userDetail);

                // Get the patients that this user cares for
                const patientDetails: Array<PatientsDetail> = [];
                if (userDetail.patient_ids) {
                    for (const patient_id of userDetail.patient_ids) {
                        const patientDetailObj: any = await API.graphql({
                            query: getPatientsDetail,
                            variables: {
                                patientId: patient_id,
                            }
                        });
                        const patientDetail: PatientsDetail = patientDetailObj["data"]["getPatientsDetail"];
                        patientDetails.push(patientDetail);
                    }
                }

                setLoading(false);
                console.log('patientDetails:', patientDetails);
                updateItems(patientDetails);
            } catch (e) {
                setLoading(false);
                console.log('getUsersDetail errors:', e);
            }
        }

        callListAllEvents()
        subscribeCreateEvents()
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
                            <>No patients found</>
                        ) : (
                            <Table sx={{ minWidth: 650 }} aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Patient Name</TableCell>
                                        <TableCell>Patient ID</TableCell>
                                        <TableCell>Sensors</TableCell>
                                        <TableCell align="right">
                                            <CreatePatient user={user} />
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((row) => (
                                        <TableRow key={row.patient_id}>
                                            <TableCell component="th" scope="row">
                                                {row.name}
                                            </TableCell>
                                            <TableCell>{row.patient_id}</TableCell>
                                            <TableCell>{row.sensor_types?.length} measures monitored</TableCell>
                                            <TableCell align="right">
                                                <ManageSensors patientId={row.patient_id!} patient={row} />
                                                <EditPatient user={user} patientId={row.patient_id!} patient={row} />
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

export default Patients;

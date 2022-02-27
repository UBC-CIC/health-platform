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
import { onCreateUsersDetail } from "../../common/graphql/subscriptions";
import { EventDetail } from "../../common/types/API";

import "./users.css";

function createData(
  name: string,
  start: number,
  finish: number,
  mood: string,
  medication: string
) {
  return { name, start, finish, mood, medication };
}

export const Devices = (props: { userName: any}) => {
  const [items, updateItems] = useState<Array<EventDetail>>(new Array<EventDetail>());
  const stateRef = useRef<Array<EventDetail>>();
  stateRef.current = items;

  useEffect(() => {

    async function subscribeCreateEvents() {
        const subscription:any = API.graphql({
            query: onCreateUsersDetail
        });

        subscription.subscribe({
            next: (data:any) => {
                console.log("data received from create subscription:", data);
                const newItems = [];
                let found = false;
                if (data.value.data) {
                    for (let item of stateRef.current!) {
                        if (data.value.data.onCreateEventDetail.userId === item.user_id) {
                            // Found existing item so we will update this item
                            newItems.push(data.value.data.onCreateEventDetail);
                            found = true;
                        } else {
                            // Keep existing item
                            newItems.push(item);
                        }
                    }
                    if (!found) {
                        newItems.push(data.value.data.onCreateEventDetail);
                    }
                    updateItems(newItems);
                }
            },
            error: (error:any) => console.warn(error)
        });
    };


    // async function subscribeUpdateMeetings() {
    //     const subscription:any = API.graphql({
    //         query: onUpdateMeetingDetail
    //     });

    //     subscription.subscribe({
    //         next: (data:any) => {
    //             const newItems = [];
    //             if (data.value.data.onUpdateMeetingDetail) {
    //                 for (let item of stateRef.current!) {
    //                     if (data.value.data.onUpdateMeetingDetail.meeting_id === item.meeting_id) {
    //                         // Found existing item so we will update this item
    //                         newItems.push(data.value.data.onUpdateMeetingDetail);
    //                     } else {
    //                         // Keep existing item
    //                         newItems.push(item);
    //                     }
    //                 }
    //                 updateItems(newItems);
    //             }
    //         },
    //         error: (error:any) => console.warn(error)
    //     });
    // };


    async function callListAllUsers() {
        try {
            const users: any = await API.graphql({
                query: listUsersDetails,
                variables: {
                    userId: props.userName,
                    limit: 100,
                }
            });
            console.log(users);
            const itemsReturned: Array<EventDetail> = users['data']['listUsersDetails']['items'];
            
            console.log('listUsersDetails:', itemsReturned);
            updateItems(itemsReturned);
        } catch (e) {
            console.log('listUsersDetails errors:', e );
        }
    }

    callListAllUsers()
    subscribeCreateEvents()
    // subscribeUpdateMeetings()

}, []);


  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="caption table">
            {
                items.length == 0 && <caption>No events found</caption>
            }
            <TableHead>
              <TableRow>
                <TableCell>Start</TableCell>
                <TableCell>Finish</TableCell>
                <TableCell align="right">Food</TableCell>
                <TableCell align="right">Mood</TableCell>
                <TableCell align="right">Medication</TableCell>
                <TableCell align="right">Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.event_id}>
                  <TableCell component="th" scope="row">
                    {row.start_date_time}
                  </TableCell>
                  <TableCell>{row.end_date_time}</TableCell>
                  <TableCell align="right">{row.food}</TableCell>
                  <TableCell align="right">{row.mood}</TableCell>
                  <TableCell align="right">{row.medication}</TableCell>
                  <TableCell align="right">{row.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Devices;

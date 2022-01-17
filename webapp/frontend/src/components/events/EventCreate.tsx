import { useState } from "react";
import { styled, Box } from "@mui/system";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  Button,
} from "@mui/material";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API, graphqlOperation } from "aws-amplify";
import { getEventDetail } from "../../common/graphql/queries";
import { createEventDetail } from "../../common/graphql/mutations";


export const EventCreate = (props: { user_id: String; disabled: any }) => {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [medication, setMedication] = useState("");
  const [mood, setMood] = useState("");
  const [food, setFood] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreateRequest = async () => {
    setOpen(true);

    console.log("hahahahaha");
    console.log(start, end, medication, mood, food, notes);
    

    try {
      const response: any = await API.graphql({
        query: createEventDetail,
        variables: {
          event_id: "yuanbian",
          user_id: "yuanbian",
          start_date_time: "2022-01-01 12:30",
          end_date_time: "2022-01-01 12:40",
          medication: medication,
          mood: mood,
          food: food,
          notes: notes

        },
      });
      console.log("createEventDetail response:", response);

      // const itemsReturned: Array<EventDetail> =
      //   specialists["data"]["getSpecialistProfilesByStatus"]["items"];
      // console.log("getMeetingDetailsByStatus meetings:", itemsReturned);
      // updateItems(itemsReturned);

      setOpen(false);
    } catch (e) {
      console.log("createEventDetail errors:", e);
    }
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleOpen}>
        Create Event
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Event Detail</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide detail to the event.
          </DialogContentText>
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": { m: 1, width: "25ch" },
            }}
            noValidate
            autoComplete="off"
          >
            <div>
              <TextField
                disabled
                id="filled-disabled"
                label="Start"
                defaultValue="2022-01-03 12:30"
                variant="filled"
                // value={start}
                // onChange={(e) => {
                //   setStart(e.target.value);
                // }}
              />
              <TextField
                disabled
                id="filled-disabled"
                label="End"
                defaultValue="2022-01-03 12:40"
                variant="filled"
                // value={end}
                // onChange={(e) => {
                //   setEnd(e.target.value);
                // }}
              />
              <TextField
                required
                id="filled-required"
                label="Medication"
                variant="filled"
                value={medication}
                onChange={(e) => {
                  setMedication(e.target.value);
                }}
              />
              <TextField
                id="filled-read-only-input"
                label="Mood"
                variant="filled"
                value={mood}
                onChange={(e) => {
                  setMood(e.target.value);
                }}
              />
              <TextField
                id="filled-search"
                label="Food"
                variant="filled"
                value={food}
                onChange={(e) => {
                  setFood(e.target.value);
                }}
              />
              <TextField
                id="filled-helperText"
                label="Additional Notes"
                helperText="Some important text"
                variant="filled"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                }}
              />
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateRequest}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EventCreate;

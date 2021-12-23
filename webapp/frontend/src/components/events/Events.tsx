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

import "./events.css";
import { Sidebar } from "./Sidebar";

function createData(
  name: string,
  start: number,
  finish: number,
  mood: string,
  medication: string
) {
  return { name, start, finish, mood, medication };
}

const rows = [
  createData("Episode 1", 159, 6.0, "Happy", "None"),
  createData("Episode 2", 237, 9.0, "Happy", "None"),
  createData("Episode 3", 262, 16.0, "Happy", "None"),
];

export const Events = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="caption table">
            <caption>A basic table example with a caption</caption>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Start</TableCell>
                <TableCell align="right">Finish</TableCell>
                <TableCell align="right">Mood</TableCell>
                <TableCell align="right">Situation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.start}</TableCell>
                  <TableCell align="right">{row.finish}</TableCell>
                  <TableCell align="right">{row.mood}</TableCell>
                  <TableCell align="right">{row.medication}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Events;

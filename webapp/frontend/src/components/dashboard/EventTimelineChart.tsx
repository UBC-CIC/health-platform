import { ChartDataset } from "chart.js";
import "chartjs-adapter-date-fns";
import { differenceInDays } from "date-fns";
import { GanttChart } from "./HorizontalBarChart";
import { ThemeColor } from "./types";

type Phase = {
    name: string;
    startDate: string;
    endDate: string;
};

const PHASES: Phase[] = [
    {
        name: "",
        startDate: "2020-12-15",
        endDate: "2020-12-16"
    }
];

const phasesToDatesets = (phases: Phase[], refDate: Date) =>
    [
        {
            backgroundColor: ThemeColor.Transparent,
            data: phases.map((phase) =>
                differenceInDays(new Date(phase.startDate), refDate)
            )
        },
        {
            backgroundColor: ThemeColor.Primary,
            hoverBackgroundColor: ThemeColor.Secondary,
            data: phases.map((phase) =>
                differenceInDays(new Date(phase.endDate), new Date(phase.startDate))
            )
        },
        {
            backgroundColor: ThemeColor.Transparent,
            hoverBackgroundColor: ThemeColor.Transparent,
            data: phases.map((phase) =>
                24
            )
        },
        {
            backgroundColor: ThemeColor.Primary,
            hoverBackgroundColor: ThemeColor.Secondary,
            minBarLength: 5,
            data: phases.map((phase) =>
                0.01
            )
        },
    ] as ChartDataset<"bar">[];

const phasesToLabels = (phases: Phase[]) => phases.map((phase) => phase.name);

export function PhaseChart() {
    const refDate = new Date("2020-12-15");
    console.log(phasesToDatesets(PHASES, refDate));
    return (
        <GanttChart
            data={{
                datasets: phasesToDatesets(PHASES, refDate),
                labels: phasesToLabels(PHASES)
            }}
            refDate={refDate}
        />
    );
}

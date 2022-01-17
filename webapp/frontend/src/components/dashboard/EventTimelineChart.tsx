import { ChartDataset } from "chart.js";
import "chartjs-adapter-date-fns";
import { differenceInDays, differenceInSeconds } from "date-fns";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { ThemeColor } from "./types";

type Phase = {
    name: string;
    startDate: string;
    endDate: string;
};

const PHASES: Phase[] = [
    {
        name: "",
        startDate: "2021-02-15",
        endDate: "2021-03-16"
    }
];

const phasesToDatesets = (phases: Phase[], refDate: Date) =>
    [
        {
            backgroundColor: ThemeColor.Transparent,
            data: phases.map((phase) => {
                console.log("PHASE " + refDate);
                return differenceInSeconds(new Date(phase.startDate), refDate);
            })
        },
        {
            backgroundColor: ThemeColor.Primary,
            hoverBackgroundColor: ThemeColor.Secondary,
            data: phases.map((phase) =>
                differenceInSeconds(new Date(phase.endDate), new Date(phase.startDate))
            )
        },
        {
            backgroundColor: ThemeColor.Transparent,
            hoverBackgroundColor: ThemeColor.Transparent,
            data: phases.map((phase) =>
                240000
            )
        },
        {
            backgroundColor: ThemeColor.Primary,
            hoverBackgroundColor: ThemeColor.Secondary,
            minBarLength: 5,
            data: phases.map((phase) =>
                3600*3
            )
        },
    ] as ChartDataset<"bar">[];

const phasesToLabels = (phases: Phase[]) => phases.map((phase) => phase.name);


type EventTimelineChartProps = {
    startDate: any;
    endDate: any;
};

export function EventTimelineChart({
    startDate,
    endDate,
}: EventTimelineChartProps) {
    const refDate = new Date(startDate);
    return (
        <HorizontalBarChart
            data={{
                datasets: phasesToDatesets(PHASES, refDate),
                labels: phasesToLabels(PHASES)
            }}
            startDate={startDate}
            endDate={endDate}
        />
    );
}

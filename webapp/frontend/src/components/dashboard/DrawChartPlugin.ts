import { Chart as ChartJsChart } from "chart.js";

type Chart = ChartJsChart;
type DrawOptions = {
    onAfterDraw: (chart: Chart) => void;
};

const PLUGIN_ID = "draw";

// @ts-ignore: ignore
const getDrawOptions = (chart: Chart): DrawOptions => chart.options.plugins[PLUGIN_ID];

export const DrawChartPlugin = {
    id: PLUGIN_ID,
    afterDatasetDraw: (chart: Chart) => {
        const options = getDrawOptions(chart);
        if (typeof options.onAfterDraw === "function") {
            options.onAfterDraw(chart);
        }
    }
};

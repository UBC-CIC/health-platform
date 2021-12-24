import {
    BarController,
    BarElement,
    CategoryScale,
    ChartConfiguration,
    ChartItem,
    LinearScale,
    Plugin
} from "chart.js";
import { useChart } from "./useChart";

type ConfigWithoutType = Omit<ChartConfiguration, "type">;

type BarChartProps = {
    config: ((ctx: ChartItem) => ConfigWithoutType) | ConfigWithoutType;
    plugins?: Plugin[];
    height?: number;
};

export function BarChart({ config, plugins = [], ...props }: BarChartProps) {
    const { Chart } = useChart({
        config: (ctx: ChartItem) => ({
            ...(typeof config === "function" ? config(ctx) : config),
            type: "bar"
        }),
        plugins: [BarController, BarElement, CategoryScale, LinearScale, ...plugins]
    });
    return <Chart {...props} />;
}

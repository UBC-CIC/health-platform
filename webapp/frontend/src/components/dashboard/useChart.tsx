import { Chart, ChartConfiguration, ChartItem, Plugin } from "chart.js";
import { useLayoutEffect, useRef } from "react";

type ChartHookConfig = {
    config: ((ctx: ChartItem) => ChartConfiguration) | ChartConfiguration;
    plugins?: Plugin[];
};

type ChartProps = { height?: number };

export function useChart({ config, plugins = [] }: ChartHookConfig) {
    const chartRef = useRef<Chart>();
    const canvasRef = useRef<HTMLCanvasElement>();
    useLayoutEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d") as ChartItem;
            Chart.register(...plugins);
            chartRef.current = new Chart(
                ctx,
                typeof config === "function" ? config(ctx) : config
            );
        }
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = undefined;
            }
        };
    }, [config, plugins]);
    return {
        Chart(props: ChartProps) {
            return <canvas ref={canvasRef as any} {...props} />;
        }
    };
}

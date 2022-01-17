import { Chart, ChartConfiguration, ChartData, TimeScale } from "chart.js";
import "chartjs-adapter-date-fns";
import { format, addDays, addSeconds, differenceInSeconds } from "date-fns";
import { useRef } from "react";
import { BarChart } from "./BarChart";
import { DrawChartPlugin } from "./DrawChartPlugin";
import { ThemeColor } from "./types";

type HorizontalBarChartProps = { data: ChartData<"bar">; startDate: string; endDate: string; };

export function HorizontalBarChart({ data, startDate, endDate }: HorizontalBarChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null)
    console.log(data);
    return (
        <BarChart
            // height={25 * data.datasets[0].data.length}
            height={25}
            // @ts-ignore
            config={
                // @ts-ignore
                {
                    data,
                    options: {
                        plugins: {
                            draw: {
                                onAfterDraw: (chart: Chart) => {
                                    const { ctx, data } = chart;
                                    ctx.fillStyle = ThemeColor.NoContrast;
                                    ctx.font = "700 14px Arial";
                                    ctx.textAlign = "left";
                                    ctx.textBaseline = "middle";
                                    chart.getDatasetMeta(0).data.forEach((bar, index) => {
                                        // @ts-ignore: ignore
                                        const label = data.labels[index] as string;
                                        ctx.fillText(label, bar.x + 10, bar.y);
                                    });
                                    ctx.restore();
                                }
                            },
                            legend: false,
                            tooltip: false
                        },
                        indexAxis: "y",
                        scales: {
                            x: {
                                position: "top",
                                stacked: true,
                                gridLines: {
                                    color: ThemeColor.GridLines,
                                    drawBorder: false,
                                    drawTicks: false
                                },
                                ticks: {
                                    callback: (val: number) => {
                                        return format(addSeconds(new Date(startDate), val), "P")
                                    },
                                    color: ThemeColor.Brand,
                                    font: { weight: "bold" },
                                    padding: 5,
                                    maxRotation: 0,
                                },
                                // type: "time",
                                // min: '2021-01-08T00:00:00Z',
                                // max: '2021-08-08T23:59:59Z',
                                min: 0,
                                max: differenceInSeconds(new Date(endDate), new Date(startDate)),
                            },
                            y: {
                                stacked: true,
                                offset: true,
                                gridLines: {
                                    color: "transparent",
                                    drawBorder: false,
                                    drawTicks: true
                                },
                                ticks: {
                                    display: false,
                                }
                            }
                        },
                        onClick: function(evt, element) {
                            if(element.length > 0) {
                                console.log(element,element[0].datasetIndex)
                                // you can also get dataset of your selected element
                                console.log(data.datasets[element[0].datasetIndex])
                            }
                        },
                        onHover: function (evt, element) {
                            if(element.length > 0 && element[0].element.options.backgroundColor !== ThemeColor.Transparent) {
                                if (evt.native && evt.native.target) {
                                    // @ts-ignore
                                    evt.native.target.style.cursor = 'pointer';
                                }
                            } else {
                                if (evt.native && evt.native.target) {
                                    // @ts-ignore
                                    evt.native.target.style.cursor = 'default';
                                }
                            }
                        }
                    }
                } as Omit<ChartConfiguration<"bar">, "type">
            }
            plugins={[DrawChartPlugin, TimeScale]}
        />
    );
}

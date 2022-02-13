import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

export const LineChart = (props: {}) => {
    const [series, setSeries] = useState<any>([
        {
            "display_name": "Example Line",
            "name": "example_line",
            "data": [
                [1604674202610, 0.3603509904280786],
                [1604674262610, 0.5359587097683846],
                [1604674322610, 0.4180802315705128],
                [1604674333610, 0.4180802315705128],
                [1604674343610, 0.4180802315705128],
                [1604674353610, 0.2180802315705128],
                [1604674363610, 0.6180802315705128],
                [1604674373610, 0.4180802315705128],
            ]
        }
    ]);

    const [options, setOptions] = useState<any>({
        chart: {
            id: 'chart2',
            type: 'line',
            height: 230,
            // toolbar: {
            //     autoSelected: 'pan',
            //     show: false
            // }
        },
        colors: ['#546E7A'],
        stroke: {
            width: 3
        },
        dataLabels: {
            enabled: false
        },
        fill: {
            opacity: 1,
        },
        markers: {
            size: 0
        },
        xaxis: {
            type: 'datetime'
        }
    });

    const [brushOptions, setBrushOptions] = useState<any>({
        chart: {
            id: 'chart1',
            height: 130,
            type: 'line',
            brush: {
                target: 'chart2',
                enabled: true
            },
            selection: {
                enabled: false,
                xaxis: {
                    min: 1604674202610,
                    max: 1604675282610
                }
            },
        },
        colors: ['#008FFB'],
        xaxis: {
            type: 'datetime',
            tooltip: {
                enabled: false
            }
        },
        fill: {
            opacity: 0
        },
        stroke: {
            width: 0
        },
        yaxis: {
            tickAmount: 2
        },
        annotations: {
            position: 'back',
            xaxis: [
                {
                    x: 1604674202610,
                    x2: 1604674222610,
                    fillColor: "#B3F7CA",
                    opacity: 2,
                    strokeDashArray: 0,
                    label: {
                        borderColor: "#fff",
                        style: {
                            position: 'top',
                            display: "none"
                        },
                        offsetY: 0
                    }
                },
                {
                    x: 1604674262610,
                    x2: 1604674322610,
                    fillColor: "#FF0000",
                    strokeDashArray: 0,
                    opacity: 2,
                    label: {
                        borderColor: "#fff",
                        style: {
                            position: 'top',
                            display: "none"
                        },
                        offsetY: 0
                    }
                }
            ]
        }
    });

    return (
        <div id="chart">
            <div id="example_line">
                <ReactApexChart options={options} series={series} type="line" height={350} />
            </div>
            <div id="example_rangeBar">
                <ReactApexChart options={brushOptions} series={series} type="line" height={100} />
            </div>
        </div>
    )
}

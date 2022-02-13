import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

export const Timeline = (props: {}) => {
    const [series, setSeries] = useState<any>([
        {
            name: 'Bob',
            data: [
                {
                    x: 'Design',
                    y: [
                        new Date('2019-03-05').getTime(),
                        new Date('2019-03-08').getTime()
                    ]
                },
                {
                    x: 'Design',
                    y: [
                        new Date('2019-03-01').getTime(),
                        new Date('2019-03-03').getTime()
                    ],
                }
            ]
        },
    ]);

    const [options, setOptions] = useState<any>({
        chart: {
            height: 40,
            type: 'rangeBar'
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '80%'
            }
        },
        xaxis: {
            type: 'datetime'
        },
        stroke: {
            width: 1
        },
        fill: {
            type: 'solid',
            opacity: 0.6
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left'
        }
    });

    return (
        <div id="chart">
            <ReactApexChart options={options} series={series} type="rangeBar" height={140} />
        </div>
    )
}

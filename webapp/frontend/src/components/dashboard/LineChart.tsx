import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

export const LineChart = (props: {}) => {

    function generateDayWiseTimeSeries(baseval: any, count: any, yrange: any) {
        var i = 0;
        var series = [];
        while (i < count) {
            var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

            series.push([baseval, y]);
            baseval += 86400000;
            i++;
        }
        return series;
    }

    const [series, setSeries] = useState<any>([{
        data: generateDayWiseTimeSeries(new Date('11 Feb 2017').getTime(), 20, {
            min: 10,
            max: 60
        })
    }]);

    const [options, setOptions] = useState<any>({
        chart: {
            id: 'fb',
            group: 'social',
            type: 'scatter',
            height: 160,
            animations: {
                enabled: false,
            },
        },
        stroke: {
            curve: 'straight',
            width: 1,
        },
        xaxis: {
            type: 'datetime',
        },
        colors: ['#008FFB']
    });

    const [series2, setSeries2] = useState<any>([{
        data: generateDayWiseTimeSeries(new Date('11 Feb 2017').getTime(), 200, {
            min: 0,
            max: 1
        })
    }]);

    const [options2, setOptions2] = useState<any>({
        chart: {
            id: 'yt',
            group: 'social',
            type: 'area',
            height: 160,
            animations: {
                enabled: false,
            },
        },
        fill: {
            type: 'solid',
            opacity: [0.35, 1],
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 0,
        },
        xaxis: {
            type: 'datetime',
        },
        stroke: {
            curve: 'stepline',
            width: 1,
        },
        tooltip: {
            shared: false,
            y: {
                formatter: function (val: any) {
                    return (val / 1000000).toFixed(0)
                }
            }
        },
        colors: ['#00E396']
    });


    return (
        <div id="chart">
            <div id="example_rangeBar">
                <ReactApexChart options={options2} series={series2} type="bar" height={160} />
            </div>
            <div id="example_line">
                <ReactApexChart options={options} series={series} type="scatter" height={350} />
            </div>
        </div>
    )
}

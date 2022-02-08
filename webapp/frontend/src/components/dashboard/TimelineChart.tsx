import React from 'react';
import { Bar } from 'react-chartjs-2';

const SPACE_IN_PIXELS_BETWEEN_DAYS = 100;

export type TimelineChartProps = {
    config: any;
    dimensions: any;
};

const TimelineChart = ({
    config,
    dimensions: { width: parentWidth, height: parentHeight }
}: TimelineChartProps) => {
    const numberOfDays = config.maxDate.diff(config.minDate, 'd');

    const width = numberOfDays * SPACE_IN_PIXELS_BETWEEN_DAYS;
    const styles = {
        height: parentHeight,
        width: parentWidth > width ? parentWidth : width
    };

    return (
        <React.Fragment>
            <h2 className="chart-title">Timeline chart example</h2>
            <div className="chart">
                <div style={styles}>
                    <Bar
                        data={config.chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            legend: {
                                display: false
                            },
                            scales: {
                                // @ts-ignore
                                yAxes: [
                                    {
                                        stacked: true
                                    }
                                ],
                                // @ts-ignore
                                xAxes: [
                                    {
                                        display: true,
                                        scaleLabel: {
                                            display: false,
                                            lineHeight: 2
                                        },
                                        type: 'time',
                                        time: {
                                            unit: 'day',
                                            unitStepSize: 1,
                                            min: config.minDate,
                                            max: config.maxDate
                                        },
                                        ticks: {
                                            beginAtZero: true
                                        }
                                    }
                                ]
                            },
                            tooltips: {
                                mode: 'nearest',
                                displayColors: false,
                                enabled: false,
                                custom: function (tooltipModel: any) {
                                    // Tooltip Element
                                    let tooltipEl = document.getElementById('chartjs-tooltip');

                                    // Create element on first render
                                    if (!tooltipEl) {
                                        tooltipEl = document.createElement('div');
                                        tooltipEl.id = 'chartjs-tooltip';
                                        tooltipEl.className = 'chart-tooltip';
                                        tooltipEl.innerHTML = '<div class="tooltip-body"></div';
                                        document.body.appendChild(tooltipEl);
                                    }

                                    // Hide if no tooltip
                                    if (tooltipModel.opacity === 0) {
                                        // @ts-ignore
                                        tooltipEl.style.opacity = 0;
                                        return;
                                    }

                                    // Set caret Position
                                    tooltipEl.classList.remove('above', 'below', 'no-transform');
                                    if (tooltipModel.yAlign) {
                                        tooltipEl.classList.add(tooltipModel.yAlign);
                                    } else {
                                        tooltipEl.classList.add('no-transform');
                                    }

                                    function getBody(bodyItem: any) {
                                        return bodyItem.lines;
                                    }

                                    // Set Text
                                    if (tooltipModel.body) {
                                        const titleLines = tooltipModel.title || [];
                                        const bodyLines = tooltipModel.body.map(getBody);
                                        const title = titleLines[0];
                                        const body = bodyLines[0];
                                        const date = body[0].substr(0, 10);
                                        let innerHtml = '<div>';
                                        if (title && date) {
                                            const model = config.tooltipData[date][title];
                                            const { data: lines, isVisible } = model;

                                            if (!isVisible) {
                                                document.body.removeChild(tooltipEl);
                                                return false;
                                            }

                                            innerHtml += `<span class="chart-tooltip-title">${title} for ${date}</span>`;

                                            if (lines.length) {
                                                innerHtml +=
                                                    '<table class="chart-tooltip-table"><thead><tr>';
                                                innerHtml +=
                                                    '<th class="chart-tooltip-th">account</th>';
                                                innerHtml += '<th class="chart-tooltip-th">value</th>';
                                                innerHtml += '</tr></thead><tbody>';

                                                lines.forEach((pl: any) => {
                                                    innerHtml += '<tr>';
                                                    innerHtml +=
                                                        '<td class="chart-tooltip-td">' +
                                                        pl.account +
                                                        '</td>';
                                                    innerHtml +=
                                                        '<td class="chart-tooltip-td">' +
                                                        pl.value +
                                                        '</td>';
                                                    innerHtml += '</tr>';
                                                });

                                                innerHtml += '</tbody></table></div>';
                                            }
                                        }

                                        const tooltipBody = tooltipEl.querySelector(
                                            '.tooltip-body'
                                        );
                                        tooltipBody!.innerHTML = innerHtml;
                                    }

                                    // `this` will be the overall tooltip
                                    // @ts-ignore
                                    const position = this._chart.canvas.getBoundingClientRect();

                                    // Display, position, and set styles for font
                                    // @ts-ignore
                                    tooltipEl.style.opacity = 1;
                                    tooltipEl.style.position = 'absolute';
                                    tooltipEl.style.left =
                                        position.left +
                                        window.pageXOffset +
                                        tooltipModel.caretX +
                                        'px';
                                    tooltipEl.style.top =
                                        position.top +
                                        window.pageYOffset +
                                        tooltipModel.caretY +
                                        'px';
                                    tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
                                    tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
                                    tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
                                    tooltipEl.style.padding =
                                        tooltipModel.yPadding +
                                        'px ' +
                                        tooltipModel.xPadding +
                                        'px';
                                    tooltipEl.style.pointerEvents = 'none';
                                    tooltipEl.style.backgroundColor = 'white';
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

export default TimelineChart;

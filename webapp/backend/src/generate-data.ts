import AWS = require('aws-sdk');
import { MetricsData, MetricsDataDao } from './ddb/metrics-dao';
var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/**
 * Input event:
 * {
 *     "patient_id": "6789",
 *     "sensor_id": "777",
 *     "num_datapoints": 10,
 *     "type": "heartrate",
 *     "start": "2021-04-07T13:58:10.104Z"
 * }
 */
exports.handler = async (event: any = {},) => {
    console.log('Generating data...');

    let datapoints: MetricsData[] = [];
    let t = new Date(event.start);
    for (var i = 0; i < event.num_datapoints; i++) {
        console.log("Generating point " + i);
        var val = Math.sin(i);

        const metricsData: MetricsData = {
            patient_id: event.patient_id,
            sensor_id: event.sensor_id,
            timestamp: t.toISOString(),
            measure_type: event.type,
            measure_value: val.toString(),
        }

        t.setSeconds(t.getSeconds() + 10);

        datapoints.push(metricsData);
    }

    console.log("Saving points " + datapoints.length);
    const dao = new MetricsDataDao(ddb);
    await dao.saveMetrics(datapoints);

    const response = {
        statusCode: 200,
        body: JSON.stringify('Done')
    };

    return response;
};

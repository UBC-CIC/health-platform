import AWS = require('aws-sdk');
import { HealthPlatformTimestreamInsertClient, MetricsData } from './timestream/client-insert';
import { SensorDao } from './ddb/sensor-dao';
var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
var firehose = new AWS.Firehose({ apiVersion: '2015-08-04' });

/**
 * {
 *     "sensorId": "777",
 *     "measurementType": "HeartRate",
 *     "measurement": "60.0, 66.0, 63.0",
 *     "timestamp": 2022-03-10T22:04:07, 2022-03-10T22:04:12, 2022-03-10T22:04:17
 * }
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log('Event: ', event);

    // Query sensor information
    //
    const sensorDao = new SensorDao(ddb);
    const sensor = await sensorDao.getSensor(event.sensorId);

    if (!sensor) {
        console.error('Sensor not found');
        return;
    }

    console.log('sensorInfo: ', sensor);
    const patientId = sensor.patient_id;

    const client = new AWS.TimestreamWrite({
        region: "us-west-2",
        endpoint: `https://ingest-cell1.timestream.us-west-2.amazonaws.com`,
    });

    console.log("Created timestream query client");
    const timestreamClient = new HealthPlatformTimestreamInsertClient(client);
    timestreamClient.writeEvent(patientId, sensor, event);

    const response = {
        statusCode: 200,
        body: JSON.stringify('Done')
    };

    return response
};

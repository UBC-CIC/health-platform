import AWS = require('aws-sdk');
import { MetricsData, MetricsDataDao } from './ddb/metrics-dao';
import { HealthPlatformTimestreamInsertClient } from './timestream/client-insert';
import { SensorDao } from './ddb/sensor-dao';
var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
var firehose = new AWS.Firehose({ apiVersion: '2015-08-04' });

/**
 * {
 *     "sensorId": "777",
 *     "ecg": 24,
 *     "heartrate": 68,
 *     "temp": 36.7,
 *     "timestamp": 1643008976,
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

    // TTL in 1 day, assumes input timestamp is in epoch seconds
    let timestamp = new Date(event.timestamp);
    let ttl = new Date(timestamp);
    ttl.setDate(timestamp.getUTCDate() + 1);

    //Write to DynamoDB
    const datapoints: MetricsData[] = [];
    const modifiedData = {
        patient_id: patientId,
        sensor_id: event.sensorId,
        timestamp: timestamp.toISOString(),
        ttl: (ttl.getTime() / 1000) | 0,
        measure_type: event.measurementType,
        measure_value: event.measurement,
    };
    datapoints.push(modifiedData);

    // This is now unused, data table has been moves to Timestream
    // const metricsDataDao = new MetricsDataDao(ddb);
    // await metricsDataDao.saveMetrics(datapoints);

    //Write to Timestream Database
    const region = "us-west-2";
    const endpointsWriteClient = new AWS.TimestreamWrite({ region });

    const qClientResponse = await endpointsWriteClient.describeEndpoints({}).promise();
    console.log(`Endpoint: ${qClientResponse.Endpoints[0].Address}`);
    const client = new AWS.TimestreamWrite({
        region,
        endpoint: `https://${qClientResponse.Endpoints[0].Address}`,
    });

    console.log("Created timestream query client");
    const timestreamClient = new HealthPlatformTimestreamInsertClient(client);
    await timestreamClient.writeRecords(modifiedData)

    const response = {
        statusCode: 200,
        body: JSON.stringify('Done')
    };

    // Write to Firehose -> S3 data lake
    const firehoseData = { ...event, patientId };
    const firehoseRes = await firehose
        .putRecord({
            DeliveryStreamName: process.env.DELIVERY_STREAM_NAME!,
            Record: {
                Data: JSON.stringify(firehoseData),
            },
        })
        .promise();

    console.log('firehoseRes: ', firehoseRes);

    return response
};

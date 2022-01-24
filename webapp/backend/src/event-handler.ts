import AWS = require('aws-sdk');
import { MetricsData, MetricsDataDao } from './ddb/metrics-dao';
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
    let timestamp = new Date(0);
    timestamp.setUTCSeconds(event.timestamp);
    let ttl = new Date(timestamp);
    ttl.setDate(timestamp.getUTCDate() + 1);

    const modalities = ["ecg", "heartrate", "temp"];
    const datapoints: MetricsData[] = [];
    modalities.forEach(modality => {
        if (modality in event) {
            const modifiedData = {
                patient_id: patientId,
                sensor_id: event.sensorId,
                timestamp: timestamp.toISOString(),
                ttl: (ttl.getTime() / 1000) | 0,
                measure_type: modality,
                measure_value: event[modality],
            };
            datapoints.push(modifiedData);

            // // Rename IoT-provided timestamp (event.ts)
            // modifiedData['iot_timestamp'] = modifiedData['ts'];
            // delete modifiedData['ts'];
            // console.log('Data for DDB:\n', modifiedData);        
        }
    });
    
    const metricsDataDao = new MetricsDataDao(ddb);
    await metricsDataDao.saveMetrics(datapoints);

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
};

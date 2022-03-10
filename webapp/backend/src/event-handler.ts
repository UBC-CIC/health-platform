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

    //Create event data for Timestream Write
    const datapoints: MetricsData[] = [];
    var measurementString = event.measurement
    var measurementTimestamps = event.timestamp
     while (measurementString !== "") {
        var measurementIndex = measurementString.indexOf(",")
        var timestampIndex = measurementTimestamps.indexOf(",")
        if (measurementIndex != -1) {
            var dataTimestamp = new Date(measurementTimestamps.substring(0, timestampIndex))
            const modifiedData = {
                patient_id: patientId,
                sensor_id: event.sensorId,
                timestamp: dataTimestamp.toISOString(),
                measure_type: event.measurementType,
                measure_value: measurementString.substring(0, measurementIndex),
            };
            datapoints.push(modifiedData);
            measurementString = measurementString.substring(measurementIndex + 2)
            measurementTimestamps = measurementTimestamps.substring(timestampIndex + 2)
        } else {
            var dataTimestamp = new Date(measurementTimestamps)
            const modifiedData = {
                patient_id: patientId,
                sensor_id: event.sensorId,
                timestamp: dataTimestamp.toISOString(),
                measure_type: event.measurementType,
                measure_value: measurementString,
            };
            datapoints.push(modifiedData);
            measurementString = ""
            measurementTimestamps = ""
        }     
    }
    
   

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
    for (var measurements of datapoints) {
        await timestreamClient.writeRecords(measurements)
    }

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

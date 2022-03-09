import AWS = require('aws-sdk');
import { HealthPlatformTimestreamInsertClient, MetricsData } from './timestream/client-insert';
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

    //Create event data for Timestream Write
    const datapoints: MetricsData[] = [];
    if (event.measurementType == "Accelerometer") {
        const first_index = event.measurement.indexOf(",") + 2
        const second_index = event.measurement.indexOf(",", first_index) + 2
        const accelerometerX = {
            patient_id: patientId,
            sensor_id: event.sensorId,
            timestamp: timestamp.toISOString(),
            ttl: (ttl.getTime() / 1000) | 0,
            measure_type: "Accelerometer X",
            measure_value: event.measurement.substring(0, first_index - 2),
        };
        const accelerometerY = {
            patient_id: patientId,
            sensor_id: event.sensorId,
            timestamp: timestamp.toISOString(),
            ttl: (ttl.getTime() / 1000) | 0,
            measure_type: "Accelerometer Y",
            measure_value: event.measurement.substring(first_index, second_index - 2),
        };
        const accelerometerZ = {
            patient_id: patientId,
            sensor_id: event.sensorId,
            timestamp: timestamp.toISOString(),
            ttl: (ttl.getTime() / 1000) | 0,
            measure_type: "Accelerometer Z",
            measure_value: event.measurement.substring(second_index),
        };
        datapoints.push(accelerometerX);
        datapoints.push(accelerometerY);
        datapoints.push(accelerometerZ);
    } else {
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
                    ttl: (ttl.getTime() / 1000) | 0,
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
                    ttl: (ttl.getTime() / 1000) | 0,
                    measure_type: event.measurementType,
                    measure_value: measurementString,
                };
                datapoints.push(modifiedData);
                measurementString = ""
                measurementTimestamps = ""
            }

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

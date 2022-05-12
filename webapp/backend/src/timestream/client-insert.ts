import AWS = require('aws-sdk');
import { Sensor } from '../ddb/sensor-dao';
var firehose = new AWS.Firehose({ apiVersion: '2015-08-04' });

export type MetricsData = {
    "patient_id": string;
    "sensor_id": string;
    "timestamp": string;
    "measure_type": string;
    "measure_value": string;
};

export class HealthPlatformTimestreamInsertClient {
    client: AWS.TimestreamWrite

    constructor(client: AWS.TimestreamWrite) {
        this.client = client;
    }

    async writeEvent(patientId: string, sensor: Sensor, events: any) {
        //Create event data for Timestream Write
        for (const event of events.data) {
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

            await this.writeRecords(patientId, sensor.sensor_id, datapoints)

            const sensorId = sensor.sensor_id

            // Write to Firehose -> S3 data lake
            const firehoseData = { ...event, patientId, sensorId};
            const firehoseRes = await firehose
                .putRecord({
                    DeliveryStreamName: process.env.DELIVERY_STREAM_NAME!,
                    Record: {
                        Data: JSON.stringify(firehoseData),
                    },
                })
                .promise();

            console.log('firehoseRes: ', firehoseRes);
        }
    }

    async writeRecords(patientId: string, sensorId: string, events: MetricsData[] = []): Promise<boolean> {
        const dimensions = [
            { 'Name': 'patient_id', 'Value': patientId },
            { 'Name': 'sensor_id', 'Value': sensorId },
        ];

        // Break the metrics data into chunks of 100 (max size of each timestream insert)
        const batches: AWS.TimestreamWrite.Record[][] = [];
        let batch: AWS.TimestreamWrite.Record[] = [];
        for (const event of events) {
            const recordTime = new Date(event.timestamp).getTime().toString() // Unix time in milliseconds
            const measureValues = [
                {
                    'Name': 'measurement_type',
                    'Value': event.measure_type,
                    'Type': 'VARCHAR'
                },
                {
                    'Name': 'measurement',
                    'Value': event.measure_value,
                    'Type': 'DOUBLE'
                }
            ];

            const patientMetrics = {
                "Dimensions": dimensions,
                "MeasureName": event.measure_type,
                "MeasureValueType": "MULTI",
                "Time": recordTime,
                "MeasureValues": measureValues
            }
            
            batch.push(patientMetrics);
            if (batch.length == 100) {
                batches.push(batch);
                batch = [];
            }
        }
        if (batch.length > 0) {
            batches.push(batch);
        }

        // Write each batch into Timestream
        for (const batch of batches) {
            const params = {
                DatabaseName: "HealthDatabase",
                TableName: "HealthMetricsData",
                Records: batch
            };
            const request = this.client.writeRecords(params);
    
            await request.promise().then(
                (data) => {
                    console.log("Write records successful")
                },
                (err) => {
                    console.log("Error writing records:", err);
                    if (err.code === 'RejectedRecordsException') {
                        // @ts-ignore
                        const responsePayload = JSON.parse(request.response.httpResponse.body.toString());
                        console.log("RejectedRecords: ", JSON.stringify(responsePayload));
                    }
                }
            );
        }

        return true;
    }
}

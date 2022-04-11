import AWS = require('aws-sdk');

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
                "MeasureName": "patient_metrics",
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

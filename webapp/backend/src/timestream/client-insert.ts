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

    async writeRecords(events: MetricsData[] = []): Promise<boolean> {
        const dimensions = [
            { 'Name': 'region', 'Value': 'us-west-2' }
        ];

        // Break the metrics data into chunks of 100 (max size of each timestream insert)
        const batches: AWS.TimestreamWrite.Record[][] = [];
        let batch: AWS.TimestreamWrite.Record[] = [];
        for (const event of events) {
            const recordTime = new Date(event.timestamp).getTime().toString() // Unix time in milliseconds
            const measureValues = [
                {
                    'Name': 'patient_id',
                    'Value': event.patient_id,
                    'Type': 'VARCHAR'
                },
                {
                    'Name': 'sensor_id',
                    'Value': event.sensor_id,
                    'Type': 'VARCHAR'
                },
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
                TableName: "HealthMetricsDataTable",
                Records: batch
            };
    
            const request = this.client.writeRecords(params);
    
            await request.promise().then(
                (data) => {
                },
                (err) => {
                    console.log("Error writing records:", err);
                    if (err.code === 'RejectedRecordsException') {
                        console.log("RejectedRecords: ", batch);
                    }
                }
            );
        }

        return true;
    }
}

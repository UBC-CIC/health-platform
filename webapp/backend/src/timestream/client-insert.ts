import AWS = require('aws-sdk');

export type MetricsData = {
    "patient_id": string;
    "sensor_id": string;
    "timestamp": string;
    "ttl"?: number;
    "measure_type": string;
    "measure_value": string;
};

export class HealthPlatformTimestreamInsertClient {
    client: AWS.TimestreamWrite

    constructor(client: AWS.TimestreamWrite) {
        this.client = client;
    }

    async writeRecords(event: any = {}): Promise<boolean> {
        console.log("Writing records");
        const currentTime = Date.now().toString(); // Unix time in milliseconds
        const recordTime = new Date(event.timestamp).getTime().toString()

        const dimensions = [
            { 'Name': 'region', 'Value': 'us-west-2' }
        ];
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

        const records = [patientMetrics];

        const params = {
            DatabaseName: "HealthDatabase",
            TableName: "HealthMetricsDataTable",
            Records: records
        };

        const request = this.client.writeRecords(params);

        await request.promise().then(
            (data) => {
                console.log("Write records successful");
            },
            (err) => {
                console.log("Error writing records:", err);
                if (err.code === 'RejectedRecordsException') {
                    console.log("RejectedRecords: ", patientMetrics);
                }
            }
        );

        return true;
    }
}

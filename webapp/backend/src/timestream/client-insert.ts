import AWS = require('aws-sdk');
import { ColumnInfo, QueryRequest, QueryResponse, QueryString, Row } from 'aws-sdk/clients/timestreamquery';

export class HealthPlatformTimestreamInsertClient {
    client: AWS.TimestreamWrite

    constructor(client: AWS.TimestreamWrite) {
        this.client = client;
    }

    async writeRecords(event: any = {}): Promise<boolean> {
        console.log("Writing records");
        const currentTime = Date.now().toString(); // Unix time in milliseconds
    
        const dimensions = [
            {'Name': 'region', 'Value': 'us-west-2'}
        ];
        if (event.measure_type != "Accelerometer") {
            var measurement = new Number(event.measure_value)
            var measurement_string = measurement.toString()
        } else {
            measurement_string = event.measure_value
        }
        const measureValues = [
            {
                'Name': 'patient_id',
                'Value': event.patient_id,
                'Type': 'BIGINT'
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
                'Value': measurement_string,
                'Type': 'VARCHAR'
            }
        ];


        const patientMetrics = { 
            "Dimensions": dimensions,  
            "MeasureName": "patient_metrics",
            "MeasureValueType": "MULTI",
            "Time": currentTime.toString(),
            "MeasureValues": measureValues
        }
       
        const records = [patientMetrics];
    
        const params = {
            DatabaseName: "HealthDatabase",
            TableName: "MetricsDataTable",
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

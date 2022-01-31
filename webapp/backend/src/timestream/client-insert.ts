import AWS = require('aws-sdk');
import { ColumnInfo, QueryRequest, QueryResponse, QueryString, Row } from 'aws-sdk/clients/timestreamquery';

export class HealthPlatformTimestreamInsertClient {
    client: AWS.TimestreamWrite

    constructor(client: AWS.TimestreamWrite) {
        this.client = client;
    }

    buildQuery(): string {
        return `
            SELECT
                time,
                fleet,
                truck_id,
                make,
                model,
                measure_name,
                load
            FROM "sampleDB".IoTMulti
            WHERE truck_id = '1234546252'`;
    }

    async writeRecords(): Promise<boolean> {
        console.log("Writing records");
        const currentTime = Date.now().toString(); // Unix time in milliseconds
    
        const dimensions = [
            {'Name': 'region', 'Value': 'us-east-1'},
            {'Name': 'az', 'Value': 'az1'},
            {'Name': 'hostname', 'Value': 'host1'}
        ];
    
        const cpuUtilization = {
            'Dimensions': dimensions,
            'MeasureName': 'cpu_utilization',
            'MeasureValue': '13.5',
            'MeasureValueType': 'DOUBLE',
            'Time': currentTime.toString()
        };
    
        const memoryUtilization = {
            'Dimensions': dimensions,
            'MeasureName': 'memory_utilization',
            'MeasureValue': '40',
            'MeasureValueType': 'DOUBLE',
            'Time': currentTime.toString()
        };
    
        const records = [cpuUtilization, memoryUtilization];
    
        const params = {
            DatabaseName: "devops-multi",
            TableName: "DevOpsMulti",
            Records: records
        };
    
        const request = this.client.writeRecords(params);
    
        await request.promise().then(
            (data) => {
                console.log("Write records successful");
            },
            (err) => {
                console.log("Error writing records:", err);
            }
        );

        return true;
    }
}

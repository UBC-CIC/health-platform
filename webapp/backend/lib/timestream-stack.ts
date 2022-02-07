import cdk = require('@aws-cdk/core');
import * as timestream from '@aws-cdk/aws-timestream';

//this stack contains the Timestream database which has to be deployed seperately from the IoT stack due to region restrictions
export class HealthPlatformTimestreamStack extends cdk.Stack {
    constructor(app: cdk.App, id: string) {
        super(app, id, {
            env: {
                region: 'us-west-2'
            },
        });
        const healthDatabase = new timestream.CfnDatabase(this, 'HealthDatabase',  {
            databaseName: 'HealthDatabase',
        });
        
        const dataTable = new timestream.CfnTable(this, 'DataTable', {
            databaseName: healthDatabase.ref,
            retentionProperties: {
                MemoryStoreRetentionPeriodInHours : "24",
                MagneticStoreRetentionPeriodInDays : "7"
            },
            tableName: 'DataTable',
        });
    } 
}    
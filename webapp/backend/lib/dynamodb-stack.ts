import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { BillingMode, StreamViewType } from "@aws-cdk/aws-dynamodb";
import { CfnOutput } from "@aws-cdk/core";
import cdk = require('@aws-cdk/core');

export class HealthPlatformDynamoStack extends cdk.Stack {
    public static EVENT_DETAIL_TABLE_ID = "EventDetailDynamoTable"
    public static EVENT_DETAIL_TABLE_NAME = "event-detail"
    public static EVENT_STATUS_GLOBAL_INDEX_NAME = "eventUserGsi"

    public static PATIENT_TABLE = "patients"
    public static SENSOR_TABLE = "sensors"
    public static SENSOR_PATIENT_GLOBAL_INDEX_NAME = "sensorsPatient"
    public static USER_TABLE = "users"

    public readonly dataTable: dynamodb.Table;
    public readonly patientTable: dynamodb.Table;
    public readonly sensorTable: dynamodb.Table;
    public readonly eventDetailsTable: dynamodb.Table;
    public readonly userTable: dynamodb.Table;

    constructor(app: cdk.App, id: string) {
        super(app, id, {
            env: {
                region: 'us-west-2'
            },
        });

        // Event Table
        //
        this.eventDetailsTable = new dynamodb.Table(this, HealthPlatformDynamoStack.EVENT_DETAIL_TABLE_ID, {
            tableName: HealthPlatformDynamoStack.EVENT_DETAIL_TABLE_NAME,
            partitionKey: {
                name: 'event_id',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
        });

        const eventUserGsiProps: dynamodb.GlobalSecondaryIndexProps = {
            indexName: HealthPlatformDynamoStack.EVENT_STATUS_GLOBAL_INDEX_NAME,
            partitionKey: {
                name: 'user_id',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'start_date_time',
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        };
        this.eventDetailsTable.addGlobalSecondaryIndex(eventUserGsiProps);

        if (this.eventDetailsTable.tableStreamArn) {
            new CfnOutput(this, `EventDetailTableStreamArn`, {
                exportName: `EventDetailTableStreamArn`,
                value: this.eventDetailsTable.tableStreamArn
            })
        }

        // Patient Table
        //
        this.patientTable = new dynamodb.Table(this, HealthPlatformDynamoStack.PATIENT_TABLE, {
            tableName: HealthPlatformDynamoStack.PATIENT_TABLE,
            partitionKey: {
                name: 'patient_id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            timeToLiveAttribute: "ttl",
        });

        // Sensor Table
        //
        this.sensorTable = new dynamodb.Table(this, HealthPlatformDynamoStack.SENSOR_TABLE, {
            tableName: HealthPlatformDynamoStack.SENSOR_TABLE,
            partitionKey: {
                name: 'sensor_id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            timeToLiveAttribute: "ttl",
        });

        const sensorPatientGsiProps: dynamodb.GlobalSecondaryIndexProps = {
            indexName: HealthPlatformDynamoStack.SENSOR_PATIENT_GLOBAL_INDEX_NAME,
            partitionKey: {
                name: 'patient_id',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'sensor_id',
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        };
        this.sensorTable.addGlobalSecondaryIndex(sensorPatientGsiProps);

        // Users Table
        //
        this.userTable = new dynamodb.Table(this, HealthPlatformDynamoStack.USER_TABLE, {
            tableName: HealthPlatformDynamoStack.USER_TABLE,
            partitionKey: {
                name: 'user_id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
        });
    }
}

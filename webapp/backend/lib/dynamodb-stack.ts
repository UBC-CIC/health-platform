import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { BillingMode, StreamViewType } from "@aws-cdk/aws-dynamodb";
import { CfnOutput } from "@aws-cdk/core";
import cdk = require('@aws-cdk/core');

// The DynamoDB stack should be created in ca-central-1 for data and privacy reasons. 
//
export class HealthPlatformDynamoStack extends cdk.Stack {
    private static MEETING_DETAIL_TABLE_ID = "MeetingDetailDynamoTable"
    public static MEETING_DETAIL_TABLE_NAME = "meeting-detail"

    public static MEETING_DATA_TABLE_NAME = "meeting-data"
    private static MEETING_DATA_TABLE_ID = "MeetingDataDynamoTable"

    public static MEETING_STATUS_GLOBAL_INDEX_NAME = "meetingStatusGsi"

    constructor(app: cdk.App, id: string) {
        super(app, id, {
            env: {
                region: 'ca-central-1'
            },
        });

        const meetingDetailsTable = new dynamodb.Table(this, HealthPlatformDynamoStack.MEETING_DETAIL_TABLE_ID, {
            tableName: HealthPlatformDynamoStack.MEETING_DETAIL_TABLE_NAME,
            partitionKey: {
                name: 'meeting_id',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
        });

        const meetingDataTable = new dynamodb.Table(this, HealthPlatformDynamoStack.MEETING_DATA_TABLE_ID, {
            tableName: HealthPlatformDynamoStack.MEETING_DATA_TABLE_NAME,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
        });
        const meetingStatusGsiProps: dynamodb.GlobalSecondaryIndexProps = {
            indexName: HealthPlatformDynamoStack.MEETING_STATUS_GLOBAL_INDEX_NAME,
            partitionKey: {
                name: 'meeting_status',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'create_date_time',
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        };
        meetingDetailsTable.addGlobalSecondaryIndex(meetingStatusGsiProps);

        if (meetingDetailsTable.tableStreamArn) {
            new CfnOutput(this, `MeetingDetailTableStreamArn`, {
                exportName: `MeetingDetailTableStreamArn`,
                value: meetingDetailsTable.tableStreamArn
            })
        }

    }
}

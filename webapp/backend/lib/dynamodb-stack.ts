import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { BillingMode, StreamViewType } from "@aws-cdk/aws-dynamodb";
import { CfnOutput } from "@aws-cdk/core";
import cdk = require('@aws-cdk/core');

// The DynamoDB stack should be created in ca-central-1 for data and privacy reasons. 
//
export class HealthPlatformDynamoStack extends cdk.Stack {
    private static EVENT_DETAIL_TABLE_ID = "EventDetailDynamoTable"
    public static EVENT_DETAIL_TABLE_NAME = "event-detail"

    public static EVENT_STATUS_GLOBAL_INDEX_NAME = "eventUserGsi"

    constructor(app: cdk.App, id: string) {
        super(app, id, {
            env: {
                region: 'ca-central-1'
            },
        });

        const eventDetailsTable = new dynamodb.Table(this, HealthPlatformDynamoStack.EVENT_DETAIL_TABLE_ID, {
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
        eventDetailsTable.addGlobalSecondaryIndex(eventUserGsiProps);

        if (eventDetailsTable.tableStreamArn) {
            new CfnOutput(this, `EventDetailTableStreamArn`, {
                exportName: `EventDetailTableStreamArn`,
                value: eventDetailsTable.tableStreamArn
            })
        }

    }
}

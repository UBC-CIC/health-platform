import { TimestreamQuery } from "@aws-sdk/client-timestream-query";

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { HealthPlatformTimestreamClient } from './timestream/client';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocument.from(client);

/**
 * Input event:
 * {
 *     "patient_id": "6789",
 *     "sensor_id": "777",
 *     "num_datapoints": 10,
 *     "type": "heartrate",
 *     "start": "2021-04-07T13:58:10.104Z"
 * }
 */
exports.handler = async (event: any = {},) => {
    console.log('Querying data...');

    const region = "us-west-2";
    const queryClient = new TimestreamQuery({ region });

    // const queryClient = new AWS.TimestreamQuery({
    //     region: "us-west-2",
    //     endpoint: "https://query.timestream.us-west-2.amazonaws.com",
    // });
    console.log("Created timestream query client");
    const timestreamClient = new HealthPlatformTimestreamClient(queryClient);
    const query = timestreamClient.buildQuery();
    const queryResponse = await timestreamClient.getAllRows(query)

    console.log(`Columns: ${JSON.stringify(queryResponse.columns)}`);
    console.log(`Rows: ${JSON.stringify(queryResponse.rows)}`);

    const response = {
        statusCode: 200,
        body: JSON.stringify('Done')
    };

    return response;
};

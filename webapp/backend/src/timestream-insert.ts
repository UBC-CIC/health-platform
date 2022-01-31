import AWS = require('aws-sdk');
import { HealthPlatformTimestreamInsertClient } from './timestream/client-insert';
import { HealthPlatformTimestreamQueryClient } from './timestream/client-query';
var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

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
    const endpointsWriteClient = new AWS.TimestreamWrite({ region });

    const qClientResponse = await endpointsWriteClient.describeEndpoints({}).promise();
    console.log(`Endpoint: ${qClientResponse.Endpoints[0].Address}`);
    const client = new AWS.TimestreamWrite({
        region,
        endpoint: `https://${qClientResponse.Endpoints[0].Address}`,
    });

    console.log("Created timestream query client");
    const timestreamClient = new HealthPlatformTimestreamInsertClient(client);
    await timestreamClient.writeRecords()

    const response = {
        statusCode: 200,
        body: JSON.stringify('Done')
    };

    return response;
};

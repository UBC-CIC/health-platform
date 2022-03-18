import AWS = require('aws-sdk');
import { HealthPlatformTimestreamQueryClient } from './timestream/client-query';
var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/**
 * Input event:
 * {
 *     "patient_ids": ["6789"],
 *     "period": "1m",
 *     "statistic": "avg",
 *     "start": "2022-01-29T13:58:10.104Z",
 *     "end": "2022-01-31T13:58:10.104Z",
 * }
 */
exports.handler = async (event: any = {},) => {
    console.log(`Querying data with event ${JSON.stringify(event)}`);
    const input = event.arguments.input;

    const region = "us-west-2";
    const endpointsQueryClient = new AWS.TimestreamQuery({ region });

    const qClientResponse = await endpointsQueryClient.describeEndpoints({}).promise();
    console.log(`Endpoint: ${qClientResponse.Endpoints[0].Address}`);
    const queryClient = new AWS.TimestreamQuery({
        region,
        endpoint: `https://${qClientResponse.Endpoints[0].Address}`,
    });

    console.log("Created timestream query client");
    const timestreamClient = new HealthPlatformTimestreamQueryClient(queryClient);
    const query = timestreamClient.buildQuery(input.patient_ids, input.period, input.statistic, input.start, input.end);
    const queryResponse = await timestreamClient.getAllRows(query)

    console.log(`Columns: ${JSON.stringify(queryResponse.columns)}`);
    console.log(`Rows: ${JSON.stringify(queryResponse.rows)}`);

    const response = {
        columns: queryResponse.columns,
        rows: queryResponse.rows
    };

    return response;
};

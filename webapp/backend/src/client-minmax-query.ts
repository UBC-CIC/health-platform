import AWS = require('aws-sdk');
import { HealthPlatformTimestreamQueryClient } from './timestream/client-query';
var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

exports.handler = async (event: any = {},) => {
    console.log(`Querying data with event ${JSON.stringify(event)}`);
    let {patientId} = event.arguments;

    const region = "us-west-2";
    const endpointsQueryClient = new AWS.TimestreamQuery({ region });

    const queryClient = new AWS.TimestreamQuery({
        region,
        endpoint: `https://query-cell1.timestream.us-west-2.amazonaws.com`,
    });

    console.log("Created timestream query client");
    const timestreamClient = new HealthPlatformTimestreamQueryClient(queryClient);
    const query = timestreamClient.buildMinMaxQuery(patientId);
    const queryResponse = await timestreamClient.getAllRows(query)

    console.log(`Columns: ${JSON.stringify(queryResponse.columns)}`);
    console.log(`Rows: ${JSON.stringify(queryResponse.rows)}`);

    const response = {
        columns: queryResponse.columns,
        rows: queryResponse.rows
    };

    return response;
};

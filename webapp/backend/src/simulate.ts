import AWS = require('aws-sdk');
import { HealthPlatformTimestreamInsertClient, MetricsData } from './timestream/client-insert';
import { HealthPlatformTimestreamQueryClient } from './timestream/client-query';
var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/**
 * Simulates user events by generating data and inserting it into Timestream.
 * Intended for development purposes.
 * 
 * Input event:
 * {
 *     "patient_id": "6789",
 *     "sensor_id": "777",
 *     "timestamp_start": "2021-04-07T13:58:10.104Z",
 *     "timestamp_end": "2021-04-07T13:58:10.104Z",
 *     "measure_type": "heartrate",
 *     "measure_value_low": 80,
 *     "measure_value_high": 100,
 *     "measure_step_seconds": 10
 * }
 */
exports.handler = async (event: any = {}) => {
    console.log(`Inserting data with event ${JSON.stringify(event)}`);
    const input = event.arguments.input;

    const region = "us-west-2";
    const endpointsWriteClient = new AWS.TimestreamWrite({ region });

    let curr = new Date(input["timestamp_start"]);
    let end = new Date(input["timestamp_end"]);

    let events: MetricsData[] = [];
    while (curr < end) {
        events.push({
            "patient_id": input["patient_id"],
            "sensor_id": input["sensor_id"],
            "timestamp": curr.toISOString(),
            "measure_type": input["measure_type"],
            "measure_value": (Math.random() * (input["measure_value_high"] - input["measure_value_low"] + 1) + input["measure_value_low"]).toString()
        });
        curr.setSeconds(curr.getSeconds() + input["measure_step_seconds"]);
    }

    // const qClientResponse = await endpointsWriteClient.describeEndpoints({}).promise();
    // console.log(`Endpoint: ${qClientResponse.Endpoints[0].Address}`);
    // const client = new AWS.TimestreamWrite({
    //     region,
    //     endpoint: `https://${qClientResponse.Endpoints[0].Address}`,
    // });

    const client = new AWS.TimestreamWrite({
        region,
        endpoint: `https://ingest-cell1.timestream.us-west-2.amazonaws.com`,
    });


    console.log("Created timestream query client");
    const timestreamClient = new HealthPlatformTimestreamInsertClient(client);
    await timestreamClient.writeRecords(input["patient_id"], input["sensor_id"], events);

    const response = {
        status: "ok",
        statusCode: 200,
        body: JSON.stringify('Done')
    };

    return response;
};

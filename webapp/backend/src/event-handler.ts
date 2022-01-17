import AWS = require('aws-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
var firehose = new AWS.Firehose({ apiVersion: '2015-08-04' });

export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log('Event: ', event);

    const params: DocumentClient.QueryInput = {
        TableName: process.env.SENSOR_MAPPING_TABLE_NAME!,
        ExpressionAttributeValues: {
            ':pkVal': event.sensorId,
        },
        ExpressionAttributeNames: {
            '#PK': 'sensor_id',
        },
        KeyConditionExpression: '#PK = :pkVal',
    };

    // Query sensor information
    const sensorRes = await ddb
        .query(params)
        .promise();
    console.log('sensorRes: ', sensorRes);
    if (!sensorRes.ScannedCount) {
        console.error('Sensor not found');
        return;
    }

    const sensorInfo = sensorRes.Items![0];
    console.log('sensorInfo: ', sensorInfo);
    const patientId = sensorInfo["patient_id"];

    // TTL in 1 day, assumes input timestamp is in epoch seconds
    let timestamp = new Date(0);
    timestamp.setUTCSeconds(event.timestamp);
    let ttl = new Date(timestamp);
    ttl.setDate(timestamp.getUTCDate() + 1);

    const modalities = ["ecg", "heartrate", "temp"];
    const writeObjects: any[] = [];
    modalities.forEach(modality => {
        if (modality in event) {
            const modifiedData = {
                patient_id: patientId,
                sensor_id: event.sensorId,
                timestamp: timestamp.toISOString(),
                ttl: (ttl.getTime() / 1000) | 0,
                measure_type: modality,
                measure_value: event[modality],
            };
            writeObjects.push({
                PutRequest: {
                    Item: modifiedData,
                }
            })

            // // Rename IoT-provided timestamp (event.ts)
            // modifiedData['iot_timestamp'] = modifiedData['ts'];
            // delete modifiedData['ts'];
            // console.log('Data for DDB:\n', modifiedData);        
        }
    })
    
    // Write to DataTable
    const ddbWriteRes = await ddb
        .batchWrite({
            RequestItems: {
                [process.env.DATA_TABLE_NAME!]: writeObjects,
            },
        })
        .promise();
    console.log('ddbWriteRes: ', ddbWriteRes);

    // Write to Firehose -> S3 data lake
    const firehoseData = { ...event, patientId };
    const firehoseRes = await firehose
        .putRecord({
            DeliveryStreamName: process.env.DELIVERY_STREAM_NAME!,
            Record: {
                Data: JSON.stringify(firehoseData),
            },
        })
        .promise();

    console.log('firehoseRes: ', firehoseRes);
};


import AWS = require("aws-sdk");

const athena = new AWS.Athena();
const s3 = new AWS.S3();
const database = "patient-export-info";
let url = ''
let myKey = ''
let returnMessage = ''
let queryResults = {} as any;
function getBucketPath(s3Raw: any) {
    // input in form s3://[bucketName]/path
    // extract bucketName and path
    s3Raw = s3Raw.substring(5)
    const bucketName = s3Raw.split("/")[0]
    const path = s3Raw.substring(s3Raw.indexOf("/") + 1)
    return (path)
}

function delay(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

export const handler = async (event: any = {}, context: any, callback: any) => {
    let { patientId, eventType } = event.arguments;
    let EXPORT_DATA_PREFIX = ''
    let outputBucketName = ''
    let queryStringInput = ''

    if (eventType === 'sensor-data'){
        queryStringInput = 'SELECT * FROM "patient-export-db"."patient-export-data" WHERE patientid = \'' + patientId + '\''
        EXPORT_DATA_PREFIX = "health-platform-metrics-patient-export-"
        outputBucketName =  EXPORT_DATA_PREFIX + context.invokedFunctionArn.split(':')[4];
    }
    else if (eventType == 'event-data'){
        queryStringInput = 'SELECT * FROM "patient-export-db"."patient-export-event-data" WHERE patient_id = \'' + patientId + '\''
        EXPORT_DATA_PREFIX = "health-platform-metrics-events-export-"
        outputBucketName =  EXPORT_DATA_PREFIX + context.invokedFunctionArn.split(':')[4];
    }   
    
    // Fill Athena query params and bucket name based off GraphQL eventType
    var params = {
        QueryString: queryStringInput,

        QueryExecutionContext: {
            Database: database,
        },
        ResultConfiguration: {
            EncryptionConfiguration: {
                EncryptionOption: "SSE_S3", /* required */
            },
            OutputLocation: "s3://" + outputBucketName
        }
    };

    const values = await athena.startQueryExecution(params).promise() ?? '';
    const queryDetails = await athena.getQueryExecution(values as any).promise();
    const myBucket =  + context.invokedFunctionArn.split(':')[4];

    if (queryDetails.QueryExecution?.ResultConfiguration !== undefined){
        myKey = getBucketPath(queryDetails.QueryExecution.ResultConfiguration.OutputLocation);
    }
    const signedUrlExpireSeconds = 60 * 5; // your expiry time in seconds.

    for (let i = 0; i < 5; i++) {
        await delay(3000)
        try {
             url = s3.getSignedUrl('getObject', {
                Bucket: outputBucketName,
                Key: myKey,
                Expires: signedUrlExpireSeconds
            });
            queryResults = await athena.getQueryResults(values as any).promise();
           break;
        } catch (e) {
            console.log("Error on S3 retrieval")
        }
    }

     
    let rowCount = 0
    if (queryResults['ResultSet'] != undefined){
        for (let i in queryResults['ResultSet']['Rows']){
            rowCount += 1
            if (rowCount > 2){
                break
            }
        }
    }
    console.log(rowCount, queryResults)

    if (rowCount > 1){
        returnMessage = url
    }
    else {
        returnMessage = 'Patient data does not exist'
    }

    if (url == null) {
        throw new Error("Cannot retrieve patient data")
    }

    return { data: returnMessage };

};
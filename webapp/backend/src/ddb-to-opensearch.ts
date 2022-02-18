import { EventDetail } from "./common/types/API";

const { HttpRequest} = require("@aws-sdk/protocol-http");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");
const { Sha256 } = require("@aws-crypto/sha256-browser");

var region = 'us-west-2'; 
var domain = process.env['OPENSEARCH_ENDPOINT']; 
var index = 'events';
var type = '_doc';

interface EventDocument {
    id: string;
    user_name: string;
    medication: string;
    mood: string;
    food: string;
    start: string;
    end: string;
  }

export const handler = (event: any = {}, context: any, callback: any) => {
    console.log('Event: ', JSON.stringify(event, null));
    var promises: Promise<any>[] = [];


    event.Records.forEach(function(record: { eventID: any; eventName: any; dynamodb: any; }) {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);

        // var index = record.dynamodb.NewImage["user_id"]["S"];
        // var id = record.dynamodb.NewImage["event_id"]["S"];
        // var mood = record.dynamodb.NewImage["mood"]["S"];
        // var med = record.dynamodb.NewImage["medication"]["S"];
        // var food = record.dynamodb.NewImage["food"]["S"];
        // var start = record.dynamodb.NewImage["start_date_time"]["S"];
        // var end = record.dynamodb.NewImage["end_date_time"]["S"];

        if (record.eventName == 'REMOVE') return;
        
        if (record.eventName == 'INSERT'){
            const image = record.dynamodb.NewImage;
            const doc: EventDetail = {
                user_id: image["user_id"]["S"],
                event_id: image["event_id"]["S"],
                mood: image["mood"]["S"],
                medication: image["medication"]["S"],
                food: image["food"]["S"],
                start_date_time: image["start_date_time"]["S"],
                end_date_time: image["end_date_time"]["S"],
                __typename: "EventDetail"
            }

            promises.push(indexDocument(doc));           
        }     
        
        
        Promise.all(promises).then((res) => {
            console.log(JSON.stringify(res, null));
        }).catch(error => {
            console.error(error.message)
        });;

        return {status:200, res:"successful"}
    
    });
};


const indexDocument = async (doc: EventDetail): Promise<any> => {
    // Create the HTTP request
    var request = new HttpRequest({
        body: JSON.stringify(doc),
        headers: {
            'Content-Type': 'application/json',
            'host': domain
        },
        hostname: domain,
        method: 'PUT',
        path: index + '/' + type + '/' + doc.event_id,
    });
       
    console.log("request: ", JSON.stringify(request, null, 2))

    // Sign the request
    console.log("Signing request")
    var signer = new SignatureV4({
        credentials: defaultProvider(),
        region: region,
        service: 'es',
        sha256: Sha256
    });
    
    var signedRequest = await signer.sign(request);
    console.log("Request signed")

    // Send the request
    var client = new NodeHttpHandler();
    return client.handle(signedRequest);

};



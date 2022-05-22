import { IncomingMessage } from "http";
import { HealthPlatformEventOpenSearchClient } from "./opensearch/search-client";

exports.handler = async (event: any = {},) => {
    console.log('Querying data...');
    const input = event.arguments.input;

    console.log("Created opensearch client");
    console.log('Event: ', JSON.stringify(event, null));
    const endpoint = process.env['OPENSEARCH_ENDPOINT'];
    const osClient = new HealthPlatformEventOpenSearchClient(endpoint);

    const queryResponse = await osClient.searchDocument(input.keyword, input.start, input.end, input.patient_name)

    const body: string = await new Promise((resolve, reject) => {
        const incomingMessage = queryResponse.response.body as IncomingMessage;
        let bodyAccum: string = '';
        incomingMessage.on('data', (chunk) => {
            bodyAccum += chunk;
        });
        incomingMessage.on('end', () => {
            resolve(bodyAccum);
        });
        incomingMessage.on('error', (err) => {
            reject(err);
        });
    });

    console.log("Got response")

    // {
    //     "took": 562,
    //     "timed_out": false,
    //     "_shards": {
    //         "total": 5,
    //         "successful": 5,
    //         "skipped": 0,
    //         "failed": 0
    //     },
    //     "hits": {
    //         "total": {
    //             "value": 1,
    //             "relation": "eq"
    //         },
    //         "max_score": 0.87546873,
    //         "hits": [
    //             {
    //                 "_index": "events",
    //                 "_type": "_doc",
    //                 "_id": "69dde578-68e0-476a-b9a3-e6c3748fc1be",
    //                 "_score": 0.87546873,
    //                 "_source": {
    //                     "user_id": "db00736d-38b2-4ab8-a474-1fe72da356c0",
    //                     "event_id": "69dde578-68e0-476a-b9a3-e6c3748fc1be",
    //                     "mood": "qbqb",
    //                     "medication": "Test sdf",
    //                     "food": "rbe",
    //                     "start_date_time": "2022-05-22T04:44:48.000Z",
    //                     "end_date_time": "2022-05-22T05:44:58.000Z",
    //                     "__typename": "EventDetail"
    //                 }
    //             }
    //         ]
    //     }
    // }

    const bodyObj = JSON.parse(body);

    // console.log("Events:")
    // console.log(bodyObj)

    const events = bodyObj["hits"]["hits"].map((hit: any) => {
        return hit["_source"];
    });

    const response = {
        events: events
    };

    return response;
};

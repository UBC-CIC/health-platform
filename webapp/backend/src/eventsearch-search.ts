import { HealthPlatformEventOpenSearchClient } from "./opensearch/search-client";

exports.handler = async (event: any = {},) => {
    console.log('Querying data...');
    const input = event.arguments.input;

    console.log("Created opensearch client");
    console.log('Event: ', JSON.stringify(event, null));
    const endpoint = process.env['OPENSEARCH_ENDPOINT'];
    const osClient = new HealthPlatformEventOpenSearchClient(endpoint);

    const queryResponse = await osClient.searchDocument(input.keyword)
    console.log("Got response")
    const util = require('util')
    console.log(util.inspect(queryResponse))

    const response = {
        statusCode: queryResponse['statusCode'],
        events: queryResponse['body']
    };



    return response;
};



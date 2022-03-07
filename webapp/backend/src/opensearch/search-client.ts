import { EventDetail } from "../common/types/API";

const { HttpRequest } = require("@aws-sdk/protocol-http");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");
const { Sha256 } = require("@aws-crypto/sha256-browser");

var region = 'us-west-2';
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

export class HealthPlatformEventOpenSearchClient {
    endpoint: String | undefined;

    constructor(endpoint: String | undefined) {
        if (endpoint == undefined) {
            console.log("ERROR - OpenSearch endpoint is not defined");
        }
        this.endpoint = endpoint;
    }


    async indexDocument(doc: EventDetail): Promise<any> {
        // Create the HTTP request
        var request = new HttpRequest({
            body: JSON.stringify(doc),
            headers: {
                'Content-Type': 'application/json',
                'host': this.endpoint
            },
            hostname: this.endpoint,
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

    async searchDocument(keyword: String): Promise<any> {
        // Create the HTTP request
        console.log(`Creating search request with keyword ${keyword}`)
        var request = new HttpRequest({
            query: {
                'query_string': {
                    'query': keyword
                }
            },
            headers: {
                'Content-Type': 'application/json',
                'host': this.endpoint
            },
            hostname: this.endpoint,
            method: 'GET',
            path: '_search',
        });

        console.log("request: ", JSON.stringify(request, null))

        var signedRequest = await this.signRequestV4(request);
        console.log("Request signed")

        // Send the request
        var client = new NodeHttpHandler();
        return client.handle(signedRequest);

    };

    private async signRequestV4(request: any): Promise<any> {
        // Sign the request
        console.log("Signing request")
        var signer = new SignatureV4({
            credentials: defaultProvider(),
            region: region,
            service: 'es',
            sha256: Sha256
        });

        return signer.sign(request);
    }

}





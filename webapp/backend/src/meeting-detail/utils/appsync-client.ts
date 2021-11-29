const aws = require("aws-sdk");
const appsync = require('aws-appsync');
require('cross-fetch/polyfill');

/*
 * Initialize GraphQL client
 *  - process.env.GRAPHQL_URL is set on cdk build.
 */
export const initAppSyncClient = () => {
    console.log('initAppSyncClient with graphql endpoint', process.env.GRAPHQL_URL)

    const graphqlClient = new appsync.AWSAppSyncClient({
        region: process.env.AWS_REGION,
        url: process.env.GRAPHQL_URL,
        auth: {
            type: 'AWS_IAM',
            credentials: aws.config.credentials
        },
        disableOffline: true,
    });

    return graphqlClient
}
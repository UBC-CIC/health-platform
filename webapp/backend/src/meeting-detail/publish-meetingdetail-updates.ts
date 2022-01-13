import { publishEventDetailUpdates, publishNewEventDetail } from '../common/graphql/mutations';
import { EventDetailInput } from '../common/types/API';
import { initAppSyncClient } from './utils/appsync-client';
import { ServerError, Success } from './utils/response';

const aws = require("aws-sdk");
const gql = require('graphql-tag');
require('cross-fetch/polyfill');

/*
 * Publishes new ddb entries by calling publishNewEventDetailUpdates mutation in AppSync
 * This event does not update any DDB data, but only send notification to AppSync.
 * This is called only when a new meeting is created.
 *
 * @param ddbNewImage newImage of DynamoStreamEvent
 * @return {statusCode: 200, body: AppSyncResponse} on success
 */
export const publishCreateMeeting = async (ddbNewImage: any) => {
    console.log('New event arrived - ddbNewImage:', JSON.stringify(ddbNewImage, null, ' '));

    try {
        const meetingDetailInput: EventDetailInput = aws.DynamoDB.Converter.unmarshall(ddbNewImage)
        console.log('meeting detail input to publish', meetingDetailInput);

        // Initialize AppSync GraphQL client
        const graphqlClient = initAppSyncClient()

        console.log('publishMeetingetailUpdates request', meetingDetailInput)
        const mutation = gql`${publishNewEventDetail}`;
        const appSyncResponse = await graphqlClient.mutate({
            mutation,
            variables: {
                input: meetingDetailInput
            }
        });

        return Success(200, appSyncResponse)
    } catch (err) {
        return ServerError(500, 'publishEventDetail failed.', err)
    }
}

/*
 * Publishes new ddb changes by calling publishEventDetailUpdates mutation in AppSync
 * This event does not update any DDB data, but only send notification to AppSync.
 * This is called only when an existing meeting is updated.
 *
 * @param ddbNewImage newImage of DynamoStreamEvent
 * @return {statusCode: 200, body: AppSyncResponse} on success
 */
export const publishUpdateMeeting = async (ddbNewImage: any) => {
    console.log('New event arrived - ddbNewImage:', JSON.stringify(ddbNewImage, null, ' '));

    try {
        const meetingDetailInput: EventDetailInput = aws.DynamoDB.Converter.unmarshall(ddbNewImage)
        console.log('meeting detail input to publish', meetingDetailInput);

        // Initialize AppSync GraphQL client
        const graphqlClient = initAppSyncClient()

        console.log('publishMeetingetailUpdates request', meetingDetailInput)
        const mutation = gql`${publishEventDetailUpdates}`;
        const appSyncResponse = await graphqlClient.mutate({
            mutation,
            variables: {
                input: meetingDetailInput
            }
        });

        return Success(200, appSyncResponse)
    } catch (err) {
        return ServerError(500, 'publishEventDetail failed.', err)
    }
}
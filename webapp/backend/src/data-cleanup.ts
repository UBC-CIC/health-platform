import AWS = require('aws-sdk');
import { MeetingDetailsDao } from './ddb/meeting-dao';

const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });

/**
 * Deletes a meeting from DynamoDB when Chime deletes the meeting.
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Invoked with details:" + JSON.stringify(event));
    const meetingId = event.arguments.input.meeting_id;

    const dao = new MeetingDetailsDao(db);
    await dao.endMeeting(meetingId);
    console.log(`Meeting ended...`);
    
    return true;
};

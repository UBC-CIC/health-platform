import { DocumentClient } from "aws-sdk/clients/dynamodb";

export type MeetingDetails = {
    "meeting_id": string;
    "create_date_time": string;
    "end_date_time"?: string;
    "call_id": string;
    "external_meeting_id": string;
    "meeting_status": string;
    "meeting_title": string;
    "meeting_comments": string;
};

export enum MeetingStatus {
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
}

export enum AttendeeJoinType {
    PSTN = "PSTN",
    DATA = "DATA",
}

export enum AttendeeState {
    PAGED = "PAGED",
    IN_CALL = "IN_CALL",
    LEFT = "LEFT",
    KICKED = "KICKED",
}

export enum AttendeeType {
    FIRST_RESPONDER = "FIRST_RESPONDER",
    SPECIALIST = "SPECIALIST",
    SERVICE_DESK = "SERVICE_DESK",
    NOT_SPECIFIED = "NOT_SPECIFIED",
}

export type JoinDataType = {
    meeting_id?: string;
    attendee_id?: string;
    external_user_id?: string;
    join_token?: string;
    media_placement?: AWS.Chime.MediaPlacement;
    media_region?: string;
}

export class MeetingDetailsDao {
    db: DocumentClient

    constructor(db: DocumentClient) {
        this.db = db;
    }

    /**
     * Registers a new meeting in DynamoDB, returning a new user-friendly external meeting ID that can be used to 
     * join the meeting through PSTN in the future.
     * 
     * @param meetingId The meeting ID.
     * @param phoneNumber The phone number the call is associated with.
     * @param attendeeId The attendee ID.
     * @param callId The call ID.
     * @param externalMeetingId The user-friendly meeting ID that users can use to dial in with.
     * @param attendeeJoinType Did the user join by data or PSTN?
     * @param attendeeState Is the user paged? in the call?
     */
    async createNewMeeting(meetingId: string): Promise<void> {

        const meetingObj: MeetingDetails = {
            "meeting_id": meetingId,
            "create_date_time": new Date().toISOString(),
            "call_id": "",
            "external_meeting_id": "",
            "meeting_status": MeetingStatus.ACTIVE.toString(),
            "meeting_title": "",
            "meeting_comments": "",
        };
        const params = {
            TableName: 'meeting-detail',
            Item: meetingObj
        };
        // Consider using a conditional write in the future to prevent overlapping external meeting IDs.
        await this.db.put(params).promise();
    }

    /**
     * Ends a meeting by updating its status in the DDB table.
     * @param meetingId The Chime meeting ID.
     */
    async endMeeting(meetingId: string): Promise<void> {
        const existingMeeting = await this.getMeetingWithMeetingId(meetingId);
        if (existingMeeting) {
            console.log(`Closing existing meeting with meeting ID ${meetingId}`);
            existingMeeting.meeting_status = MeetingStatus.CLOSED.toString();
            existingMeeting.end_date_time = new Date().toISOString();
            await this.saveMeetingDetails(existingMeeting);
        }
    }

    /**
     * Saves a new meeting detail.
     * 
     * @param meetingDetails The updated meeting details.
     */
    async saveMeetingDetails(meetingDetails: MeetingDetails): Promise<void> {
        const params = {
            TableName: 'meeting-detail',
            Item: meetingDetails
        };
        await this.db.put(params).promise();
    }

    /**
     * Retrieves a meeting with the UUID
     * 
     * @param meetingId The meeting ID (UUID format)
     * @returns The meeting if it exists.
     */
    async getMeetingWithMeetingId(meetingId: string): Promise<MeetingDetails> {
        const params: DocumentClient.GetItemInput = {
            TableName: 'meeting-detail',
            Key: {
                "meeting_id": meetingId
            }
        };
        // Consider using a conditional write in the future to prevent overlapping external meeting IDs.
        const result = await this.db.get(params).promise();
        return result?.Item as MeetingDetails;
    }

    /**
     * Gets a list of active, ongoing meetings.
     */
    async getActiveMeetings(): Promise<MeetingDetails[]> {
        const params: DocumentClient.QueryInput = {
            TableName: 'meeting-detail',
            IndexName: 'meetingStatusGsi',
            KeyConditionExpression: 'meeting_status = :hkey',
            ExpressionAttributeValues: {
                ':hkey': MeetingStatus.ACTIVE.toString(),
            }
        };

        const scanResults: MeetingDetails[] = [];
        var items: DocumentClient.QueryOutput;
        do {
            items = await this.db.query(params).promise();
            items.Items?.forEach((item) => scanResults.push(item as MeetingDetails));
            params["ExclusiveStartKey"] = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey !== "undefined");

        return scanResults;
    }
}

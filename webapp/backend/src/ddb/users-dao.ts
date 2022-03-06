import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const USER_TABLE_NAME = "users";

export type User = {
    "user_id": string;
    "email": string;
    "patient_ids": string[];
    "user_type": string;
};

export class UsersDao {
    db: DocumentClient

    constructor(db: DocumentClient) {
        this.db = db;
    }

    /**
     * Create a user
     * 
     * @param userProfile The user profile to save.
     */
     async createUser(userProfile: User): Promise<Boolean> {
        const existingUserProfile = await this.getUser(userProfile.user_id);
        if (existingUserProfile) {
            // If any existing user profile exists, we should not attempt to create a new profile.
            return false;
        }

        const params = {
            TableName: USER_TABLE_NAME,
            Item: userProfile
        };
        await this.db.put(params).promise();
        return true;
    }

    /**
     * Retrieves a user based on its ID
     * 
     * @param id The user ID
     * @returns The user if it exists.
     */
     async getUser(id: string): Promise<User | null> {
        const params: DocumentClient.QueryInput = {
            TableName: USER_TABLE_NAME,
            ExpressionAttributeValues: {
                ':pkVal': id,
            },
            ExpressionAttributeNames: {
                '#PK': 'user_id',
            },
            KeyConditionExpression: '#PK = :pkVal',
        };

        // Query sensor information
        const res = await this.db
            .query(params)
            .promise();
        console.log('sensorRes: ', res);
        if (!res.ScannedCount) {
            console.error('Sensor not found');
            return null;
        }

        const info = res.Items![0] as User;
        return info;
    }
}

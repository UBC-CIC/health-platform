import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const PATIENT_TABLE_NAME = "patients";

export type Patient = {
    "patient_id": string;
    "username": string;
    "sensor_types": string[];
};

export class PatientsDao {
    db: DocumentClient

    constructor(db: DocumentClient) {
        this.db = db;
    }

    /**
     * Create a patient
     * 
     * @param userProfile The user profile to save.
     */
     async createPatient(userProfile: Patient): Promise<Boolean> {
        const existingUserProfile = await this.getPatient(userProfile.patient_id);
        if (existingUserProfile) {
            // If any existing user profile exists, we should not attempt to create a new profile.
            return false;
        }

        const params = {
            TableName: PATIENT_TABLE_NAME,
            Item: userProfile
        };
        await this.db.put(params).promise();
        return true;
    }

    /**
     * Retrieves a patient based on its ID
     * 
     * @param id The patient ID
     * @returns The patient if it exists.
     */
     async getPatient(id: string): Promise<Patient | null> {
        const params: DocumentClient.QueryInput = {
            TableName: PATIENT_TABLE_NAME,
            ExpressionAttributeValues: {
                ':pkVal': id,
            },
            ExpressionAttributeNames: {
                '#PK': 'patient_id',
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

        const info = res.Items![0] as Patient;
        return info;
    }
}

import AWS = require('aws-sdk');
import { PatientsDao } from './ddb/patients-dao';

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });

/**
 * Creates a new user profile after the user confirms their signup.
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Creating user profile...");
    console.log(event);

    const userName = event["userName"];
    const email = event["request"]["userAttributes"]["email"];
    // const name = event["request"]["userAttributes"]["name"];

    const dao = new PatientsDao(db);
    await dao.createPatient({
        // name: "", // TODO: Need to add username into Cognito user pool
        username: email,
        sensor_types: [],
        patient_id: userName,
    });

    // Return to Amazon Cognito
    callback(null, event);
};

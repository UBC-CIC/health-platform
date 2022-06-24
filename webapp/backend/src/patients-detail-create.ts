import AWS = require('aws-sdk');
import { UsersDao } from './ddb/users-dao';

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });

var first_user_count = 0

/**
 * Creates a new user profile after the user confirms their signup.
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Creating user profile...");
    console.log(event);

    const userName = event["userName"];
    const email = event["request"]["userAttributes"]["email"];
    // const name = event["request"]["userAttributes"]["name"];

    const dao = new UsersDao(db);

    if (first_user_count != 0) {
        await dao.createUser({
            email: email,
            patient_ids: [],
            user_id: userName,
            user_type: "UNCLASSIFIED"
        });
    } else {
        //first created user must be an admin
        first_user_count++;
        await dao.createUser({
            email: email,
            patient_ids: [],
            user_id: userName,
            user_type: "ADMIN"
        });
    }
    

    // Return to Amazon Cognito
    callback(null, event);
};

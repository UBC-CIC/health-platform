# Backend and Frontend Stack Deep Dive

## Architecture

![alt text](./images/pacific-autism-architecture.jpg)

## Description

The Architecture diagram gives an insight into two different event flows: 1) IoT sensor data and API-based data, and 2) user-initiated events from the frontend dashboard are processed. Green numbers indicate event flow from IoT sensors and APIs while blue numbers indicate Event flow from user interaction with the frontend Health Platform website

### IoT Event Flow

1. Sensor data flows into the AWS cloud via Amazon IoT. The iOS application leverages the Amazon Cognito user pool to authenticate the user while the DIY Arduino Gas Sensor authenticates into the solution using private certificate keys. 

2. The Airthings API is called every 5 minutes by a Lambda function. The authentication occurs via a token that is obtained at the Airthings integration APIs. 

3. The Biostrap API is called every 5 minutes by a Lambda function. The authentication occurs via a orgnization API key from the Biostrap dashboard. 

4. The incoming data’s sensor id is mapped with the corresponding patient ID stored in a DynamoDB table; which is manually populated at the web interface. 

5. The data along with the matching patient ID is written into the Amazon Timestream database.

6. The data along with the matching patient ID is also converted to parquet format via Kinesis Firehose and the conversion schema is stored in a Glue table. The parquet file is saved in an S3 bucket with the path data/year/month/day/hour/{filename}, to create a data lake with the patient biometric information to later use in the model creation. 

### UI User Initiated Event Flow

7. The frontend website enables managing the user roles: admins and caregivers, who are the ones effectively authenticating into the application that is based on the Amazon Cognito user pool. The caregivers register the patients and their device ID into the system, which is stored in Amazon Timestream and S3. The solution backend API is based on GraphQL leveraging AWS Appsync

8. Whenever the user clicks the search button to update the dashboard, a Lambda function queries Timestream for the data based on the timeframe parameters specified by the user. This displays the most up-to-date data for the user to see.

9. Newly created users are stored in the DynamoDB users table. Existing users and their information such as the patients they manage are also stored in this table.

10. Indexed events are searched using OpenSearch which will display the search results on the frontend website for the user. 

11. Events created using the website are indexed by Amazon OpenSearch so that they can be searched by users later. OpenSearch is a search engine that will allow the user to match search keywords with event data. The event data is also converted to parquet format via Kinesis Firehose and the conversion schema is stored in a Glue table. The parquet file is saved in an S3 bucket with the path data/year/month/day/hour/{filename}, to create a data lake with the patient event data to later use in the model creation. 

12. Users can download all of a patient’s sensor readings via a button on the frontend website. A Glue database points to the data in the Health Platform Metrics S3 bucket and Health Platform Events S3 bucket. A GraphQL query then triggers a Lambda function which triggers Athena to query the Glue database. The patient data is exported to the Patient Export Data bucket and returned as a CSV file available for download through a pre-signed S3 URL link that expires after 5 minutes.

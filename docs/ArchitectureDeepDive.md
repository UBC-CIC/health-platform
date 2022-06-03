# Backend and Frontend Stack Deep Dive

### Architecture

![alt text](./images/pacific-autism-architecture.jpg)

### Description

The Architecture diagram gives an insight into two different event flows, how sensor data is ingested after being receved by IoT, and how user initiated events from the frontend dashboard are processed. Green numbers indicate Event flow from IoT sensors while blue numbers indicate Event flow from user interaction with the frontend Health Platform website.

1. Sensor data is entered into the AWS cloud via Amazon IoT. If the data is coming from the iOS application, credentials for access to IoT are provided through a Cognito user pool. Permissions to access IoT for the Arduino Gas Sensor and Airthings device are granted through certificates and private keys. If the device connecting to IoT is an Arduino Gas Sensor, it connects to an IoT thing with corresponding certificates and keys before sending the data, which is then selected based on its specified topic. Data coming from the iOS application and Airthings device is directly selected.

2. The Airthings API is called every 5 minutes by the external sensor Lambda function. The latest sensor data is then sent to the event handler Lambda function for further processing. If the API returns any data in an unexpected JSON format, it will be sent to an SQS Dead Letter Queue.

3. The incoming data’s sensor id is matched with the corresponding patient ID stored in a DynamoDB table. 

4. The data along with the matching patient ID is written into the Timestream database. In the case that the record is rejected, the data will be sent to a rejected records S3 bucket instead.

5. The data along with the matching patient ID is converted to parquet format via Kinesis Firehose and the conversion schema is stored in a Glue table. The parquet file is saved in an S3 bucket with the path data/year/month/day/hour/{filename}.

6. The frontend Amplify website is built with React and is the user interface that all users (admins and caregivers) will interact with. Accounts are created and logged into using a Cognito user pool. Data that is displayed and edited with the frontend website is synced to the backend using AppSync.

7. Whenever the user clicks the search button to update the dashboard, a Lambda function queries Timestream for the data based on the timeframe parameters specified by the caregiver.

8. Users that create an account invoke a Lambda function that will create a Patient and store their information in DynamoDB.

9. Events created in the frontend website will call an OpenSearch Lambda function that will index the event and store it in DynamoDB.

10. Indexed events are searched using an OpenSearch Lambda function which will display the search results on the frontend website.

11. Users can download all of a patient’s data via a button on the frontend website. A Lambda function will use Athena to query the Health Platform Metrics S3 bucket for all of the patient’s data. The Lambda function then converts that data into a csv file, which will be returned with a signed link to the S3 file.

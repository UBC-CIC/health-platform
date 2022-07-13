# v1.0.0

New Features:

- Patient event data download

- Date Time Picker for patient data downloads

- Biostrap API integration, view deployment instructions [here](../docs/sensor_deployment/BiostrapDeployment.md)

BugFixes:

- Patients that return no data from download Athena Queries will no longer return a csv

- The first user that registers on the Amplify website will now be automatically given ADMIN status

- The OpenSearch indexer Lambda function will no longer repeatedly timeout and restart

- The Simulate tab will now show the correct sensor data types

- Removed unneeded legacy code
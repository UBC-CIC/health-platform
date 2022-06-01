# Health Platform Webapp

## Development Link

https://main.didcpzwpk1imq.amplifyapp.com/

## Table of Contents
- [Dependencies](#Dependencies)
- [Deployment](#Deployment)

## Dependencies
- Install the [AWS CLI](https://aws.amazon.com/cli/) tool.
- Install the [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/cli.html) CLI tool.
- Install the [Amplify CLI](https://docs.amplify.aws/cli) tool.
- Configure the AWS CLI tool for your AWS Account in the `ca-central-1` region, using a user with programmatic access and the "AdministratorAccess" policy (moving forward, we will assume you have [configured a profile](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/configure/index.html) called `health-platform`):
  > `aws configure --profile health-platform`

## Deployment
### Backend
The `backend` folder contains AWS CDK stacks and AWS Lambda function code that will manage the data stores and corresponding interactions with the webapp.

Run `cd backend` and follow the instructions in [backend/README.md](./backend/README.md)

### Frontend
The `frontend` folder contains the Service Desk dashboard as a React app.

Run `cd frontend` and follow the instructions in [frontend/README.md](./frontend/README.md)


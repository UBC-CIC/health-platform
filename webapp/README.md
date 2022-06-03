# Health Platform Webapp

## Table of Contents
- [Dependencies](#Dependencies)
- [Clone The Repository](#clone-the-repository)
- [Deployment](#Deployment)

## Dependencies
Before you start deploying, you must have the following dependencies:
- [AWS Account](https://aws.amazon.com/account/) 
- [GitHub Account](https://github.com/) 
- Install the [AWS CLI](https://aws.amazon.com/cli/) tool.
- Install the [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/cli.html) CLI tool.
- Install the [Amplify CLI](https://docs.amplify.aws/cli) tool.
- Configure the AWS CLI tool for your AWS Account in the `us-west-2` region, using a user with programmatic access and the "AdministratorAccess" policy (moving forward, we will assume you have [configured a profile](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/configure/index.html) called `health-platform`):
  > `aws configure --profile health-platform`

## Clone The Repository

First, clone the github repository onto your machine. To do this:
1. Create a folder on your desktop to contain the code.
2. Open terminal (or command prompt if on windows) and **cd** into the created folder.
3. Clone the github repository by entering the following:
```
git clone https://github.com/UBC-CIC/health-platform.git
```

The code should now be in the above folder. Now navigate into the webapp folder by running the following command:
```
cd webapp
```
Proceed onto the [backend deployment](#backend).

## Deployment
### Backend
The `backend` folder contains AWS CDK stacks and AWS Lambda function code that will manage the data stores and corresponding interactions with the webapp.

Run `cd backend` and follow the instructions in [backend/README.md](./backend/README.md).

### Frontend
The `frontend` folder contains the Health Platform dashboard as a React app.

Run `cd frontend` and follow the instructions in [frontend/README.md](./frontend/README.md).


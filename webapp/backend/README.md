# Health Platform Admin Backend

The `backend` folder contains AWS CDK stacks and AWS Lambda function code that will manage the data stores and corresponding interactions with the Service Desk dashboard, handle incoming Amazon Chime PSTN or app triggered calls, handle the paging of specialists, and cleanup disconnected calls.

## Table of Contents
- [Deployment](#deployment)
    - [Install](#install)
    - [CDK Deployment](#cdk-deployment)
    - [Set Up Amazon Simple Email Service](#set-up-amazon-simple-email-service)
    - [Updating GraphQL Schema](#updating-graphql-schema)

## Deployment

### Install
Install the core dependencies:
```
npm install
```

Install dependencies required by the AWS Lambda functions. Note that this generates a separate `node_modules` directory in the `src` folder. This is done because everything under the `src` folder will be uploaded to AWS Lambda and we want to exclude the packages (e.g. `aws-sdk`) that already comes with AWS Lambda:
```
cd src/
npm install
cd ..
```

### CDK Deployment
Initialize the CDK stacks (required only if you have not deployed this stack before). Note that by default, all stacks are created in `ca-central-1`, except for the the PSTN stack which must be created in `us-east-1` due to region restriction in the AWS Chime SDK:
```
cdk synth --profile health-platform
cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/ca-central-1 --profile health-platform
```

Deploy the CDK stacks (this will take ~10 min):
```
npm run build
cdk deploy --all --profile health-platform
```

You may also deploy the stacks individually:
```
cdk deploy HealthPlatformDynamoStack  --profile health-platform
cdk deploy HealthPlatformLambdaStack  --profile health-platform
cdk deploy HealthPlatformCognitoStack --profile health-platform
cdk deploy HealthPlatformAppSyncStack --profile health-platform
cdk deploy HealthPlatformIotStack --profile health-platform
```

### Set Up Amazon Simple Email Service
> :warning: **Head's Up**: Before you send email through Amazon SES, you need to verify that you own the "From" address. If your account is still in the Amazon SES sandbox, you also need to verify your "To" addresses. You can verify email addresses or entire domains. For more information, see [Verifying identities in Amazon SES](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-addresses-and-domains.html).

- Verify that you own the "From" address:
    - On the AWS console, navigate to the Amazon Simple Email Service page.
    - On the left pane, click **Domains** or **Email Addresses** depending on whether you want to verify email addresses or entire domains. The notification lambda in this project currently only supports email address.
    - Click **Verify a New Domain/Email Address** button on top, fill the domain or email address you would like to verify
    - Get Email Addresses for verifying domain or Email Addresses for verifying email address
    - Configure the verified email address in the HealthPlatformAppSyncStack stack `SES_FROM_ADDRESS` for `notifySpecialistFunction`
- [Escape Sandbox](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html)
    - One the Amazon Simple Email Service page, choose **Sending Statistics** under **Email Sending**
    - For Your account details, choose **Edit your account details**
    - In the account details modal, fill out the account details, and **Submit for review**


### Updating GraphQL Schema

The `backend/src/common` folder contains the GraphQL schema that is used by both the backend and frontend website.

After performing any model changes to `schema.graphql`, run the following commands from within the `common` directory:
```
# generates backend/src/common/types/API.ts
amplify codegen types

# generates backend/src/common/graphql/mutation.ts, backend/src/common/graphql/query.ts, backend/src/common/graphql/subscriptions.ts
amplify-graphql-docs-generator --schema graphql/schema.graphql --output ./graphql --language typescript --separateFiles --maxDepth 10
```

Double check that the `*.ts` and `*.graphql` files have been properly updated.

More detailed instructions in [here](src/common/README.md).

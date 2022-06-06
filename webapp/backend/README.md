# Health Platform Admin Backend

The `backend` folder contains AWS CDK stacks and AWS Lambda function code that will handle the ingestion of IoT data as well as user intiated events from the frontend dashboard.

| Index                                                      | Description                                               |
|:-----------------------------------------------------------|:----------------------------------------------------------| 
| [Install](#step-1-install-dependencies)                    | Install required npm core dependencies                    |
| [CDK Deployment](#step-2-cdk-deployment)                   | How to deploy the backend cdk stacks                      |
| [Updating GraphQL Schema](#step-3-updating-graphql-schema) | Updating GraphQL Schema for frontend and backend stacks   |
| [Frontend Deployment](#step-4-frontend-deployment)         | Proceed to frontend deployment                            |

## Step 1: Install Dependencies
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

## Step 2: CDK Deployment
Initialize the CDK stacks (required only if you have not deployed this stack before). Note that by default, all stacks are created in `us-west-2` due to region restrictions for Amazon Timestream.
```
cdk synth --profile health-platform
cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/us-west-2 --profile health-platform
```

Deploy the CDK stacks (this will take ~10 min):

For Mac OS
```
npm run build
cdk deploy --all --profile health-platform
```

For Windows OS
```
npm run build-windows
cdk deploy --all --profile health-platform
```

You may also deploy the stacks individually:
```
cdk deploy HealthPlatformDynamoStack  --profile health-platform
cdk deploy HealthPlatformLambdaStack  --profile health-platform
cdk deploy HealthPlatformCognitoStack --profile health-platform
cdk deploy HealthPlatformAppSyncStack --profile health-platform
cdk deploy HealthPlatformIotStack --profile health-platform
cdk deploy HealthPlatformSearchStack --profile health-platform
```

These stacks are deployed using the account you configured under the [dependencies](../README.md#dependencies) step. If you encounter an AWS account error while deploying the stack, check that you have configured your account correctly.

## Step 3: Updating GraphQL Schema

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

## Step 4: Frontend Deployment
Run the following command and proceed with the [frontend deployment](../frontend/README.md)
```
cd ../frontend
```

# Health Platform Admin Backend

The `backend` folder contains AWS CDK stacks and AWS Lambda function code that will handle the ingestion of IoT data as well as user intiated events from the frontend dashboard.

| Index                                                      | Description                                               |
|:-----------------------------------------------------------|:----------------------------------------------------------| 
| [Install Dependencies](#step-1-install-dependencies)       | Install required npm core dependencies                    |
| [CDK Deployment](#step-2-cdk-deployment)                   | How to deploy the backend cdk stacks                      |
| [Updating GraphQL Schema](#step-3-updating-graphql-schema) | Updating GraphQL Schema for frontend and backend stacks   |
| [Frontend Deployment](#step-4-frontend-deployment)         | Proceed to frontend deployment                            |

## Step 1: Install Dependencies
Ensure you are in the backend directory, then install the core dependencies:
```
npm install
```

If this command gives you an error, run the following commands instead:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 14.14.0
nvm use 14.14.0
npm install
```

Install dependencies required by the AWS Lambda functions. Note that this generates a separate `node_modules` directory in the `src` folder. This is done because everything under the `src` folder will be uploaded to AWS Lambda and we want to exclude the packages (e.g. `aws-sdk`) that already comes with AWS Lambda:
```
cd src/
npm install
cd ..
```

The run the respective npm build command for your operating system:

For Mac OS
```
npm run build
```

For Windows OS
```
npm run build-windows
```

## Step 2: CDK Deployment
Initialize the CDK stacks (required only if you have not deployed this stack before). Note that by default, all stacks are created in `us-west-2` due to region restrictions for Amazon Timestream.
```
cdk synth --profile health-platform
cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/us-west-2 --profile health-platform
```

Deploy the CDK stacks (this will take 30-40 minutes):

If you run into any issues while deploying, refer to [Troubleshooting](#troubleshooting) for solutions.

```
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
cdk deploy HealthPlatformVpcStack --profile health-platform
```
### TroubleShooting

#### AWS Account error

These stacks are deployed using the account you configured under the [dependencies](../README.md#dependencies) step. If you encounter an AWS account error while deploying the stack, check that you have configured your account correctly.

#### CDK Deployment stuck while deploying OpenSearch Domain for HealthPlatformSearchStack

If CDK deployment appears to be stuck on the deployment of the OpenSearch Domain for the HealthPlatformSearchStack, please continue waiting as this is not any issue with the deployment. This is due to the nodes for the OpenSearch Domain taking approximately 20 to 30 minutes to intialize.

#### VPC Endpoint service does not exist

If you run into an error that says **The Vpc Endpoint Service 'com.amazonaws.us-west-2.timestream.ingest-cell1' does not exist** while deploying the HealthPlatformVpcStack, visit the [Amazon Timestream](https://us-west-2.console.aws.amazon.com/timestream/home?region=us-west-2#databases) page in the console and rerun the cdk deploy command.
```
cdk deploy HealthPlatformVpcStack --profile health-platform
```

#### Failed to assume service linked role AppSync

If your run into an error that says **Failed to assume service-linked role arn:aws:iam::YOUR_ACCOUNT_ID:role/aws-service-role/appsync.amazonaws.com/AWSServiceRoleForAppSync, please retry** while deploying the AppSync stack, simply rerun the cdk deploy command.
```
cdk deploy HealthPlatformAppSyncStack --profile health-platform
```

## Step 3: Updating GraphQL Schema

The `backend/src/common` folder contains the GraphQL schema that is used by both the backend and frontend website.

After performing any model changes to `schema.graphql`, run the following commands from within the `common` directory:
```
#installs required graphql dependencies
npm install -g amplify-graphql-docs-generator

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

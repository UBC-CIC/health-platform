import cdk = require('@aws-cdk/core');
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement, Effect } from '@aws-cdk/aws-iam';

// The Lambda stack contains all the Lambda functions that are not directly related to PSTN. 
// These Lambda functions can be created safely in ca-central-1.
//
export class HealthPlatformLambdaStack extends cdk.Stack {
    constructor(app: cdk.App, id: string, graphqlUrl: string) {
        super(app, id, {
            env: {
                region: 'ca-central-1'
            },
        });

        const lambdaRole = new Role(this, 'HealthPlatformBackendLambdaRole', {
            roleName: 'HealthPlatformBackendLambdaRole',
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            inlinePolicies: {
                additional: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            effect: Effect.ALLOW,
                            actions: [
                                // DynamoDB
                                'dynamodb:Scan',
                                'dynamodb:GetItem',
                                'dynamodb:PutItem',
                                'dynamodb:Query',
                                'dynamodb:UpdateItem',
                                'dynamodb:DeleteItem',
                                'dynamodb:BatchWriteItem',
                                'dynamodb:BatchGetItem',
                                // IAM
                                'iam:GetRole',
                                'iam:PassRole',
                                // Lambda
                                'lambda:InvokeFunction',
                                // S3
                                's3:GetObject',
                                's3:PutObject',
                                's3:ListBucket',
                                'kms:Decrypt',
                                'kms:Encrypt',
                                'kms:GenerateDataKey',
                                // SNS
                                'sns:*',
                                // STS
                                'sts:AssumeRole',
                                // CloudWatch
                                'cloudwatch:*',
                                'logs:*',
                                // AppSync
                                "appsync:GraphQL",
                                "appsync:GetGraphqlApi",
                                "appsync:ListGraphqlApis",
                                "appsync:ListApiKeys"
                            ],
                            resources: ['*']
                        })
                    ]
                }),
            },
        });
    }
}

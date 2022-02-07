import cdk = require('@aws-cdk/core');
import { Runtime, DockerImageCode, DockerImageFunction, Function } from '@aws-cdk/aws-lambda';
import alp = require('@aws-cdk/aws-lambda-python');
import exec = require("child_process");
import * as path from 'path';
import * as lambda from "@aws-cdk/aws-lambda";
import { RetentionDays } from '@aws-cdk/aws-logs';
// import { PythonFunction } from "@aws-cdk/aws-lambda-python";
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement, Effect } from '@aws-cdk/aws-iam';

// The Lambda stack contains all the Lambda functions that are not directly related to PSTN. 
// These Lambda functions can be created safely in ca-central-1.
//
export class HealthPlatformLambdaStack extends cdk.Stack {
    public readonly lambdaRole: Role;
    // public readonly queryFunction: DockerImageFunction;
    public readonly queryFunction: Function;

    constructor(app: cdk.App, id: string) {
        super(app, id, {
            env: {
                region: 'us-west-2'
            },
        });

        this.lambdaRole = new Role(this, 'HealthPlatformBackendLambdaRole', {
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
                                "appsync:ListApiKeys",
                                // Timestream
                                'timestream:WriteRecords',
                                'timestream:DescribeEndpoints',
                                'timestream:DescribeTable',
                                'timestream:ListDatabases',
                                'timestream:ListMeasures',
                                'timestream:ListTables',
                                'timestream:Select',
                                'timestream:SelectValues',
                            ],
                            resources: ['*']
                        })
                    ]
                }),
            },
        });

        // Unnecessary if using Timestream
        //
        // const queryDockerFile = path.join(__dirname, "..");
        // this.queryFunction = new DockerImageFunction(this, 'QueryDockerFunction', {
        //     code: DockerImageCode.fromImageAsset(queryDockerFile),
        //     functionName: `QueryFunction`,
        //     memorySize: 512,
        //     role: this.lambdaRole,
        //     timeout: cdk.Duration.seconds(30),
        //     logRetention: RetentionDays.THREE_MONTHS,
        // })

        this.queryFunction = new lambda.Function(this, 'TimestreamQueryFunction', {
            functionName: "Timestream-Query",
            code: new lambda.AssetCode('build/src'),
            handler: 'timestream-query.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: this.lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(300), 
        });

        new lambda.Function(this, 'TimestreamInsertFunction', {
            functionName: "Timestream-Insert",
            code: new lambda.AssetCode('build/src'),
            handler: 'timestream-insert.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: this.lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(300), 
        });
    }
}

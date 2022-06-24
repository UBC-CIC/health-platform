import cdk = require('@aws-cdk/core');
import * as ec2 from '@aws-cdk/aws-ec2';
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import * as lambda from "@aws-cdk/aws-lambda";
import { Function } from '@aws-cdk/aws-lambda';
import { HealthPlatformVpcStack } from './vpc-stack';

export class HealthPlatformLambdaStack extends cdk.Stack {
    public readonly lambdaRole: Role;
    public readonly queryFunction: Function;
    public readonly simulateFunction: Function;
    public readonly externalSensorFunction: Function;
    public readonly athenaS3QueryFunction: Function;

    constructor(app: cdk.App, id: string, vpcStack: HealthPlatformVpcStack) {
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
                                's3:GetBucketLocation',
                                "s3:ListBucketMultipartUploads",
                                "s3:AbortMultipartUpload",
                                "s3:ListMultipartUploadParts",
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
                                // VPC
                                'ec2:CreateNetworkInterface',
                                'ec2:Describe*',
                                'ec2:DeleteNetworkInterface',
                                //Athena
                                'athena:*',
                                //Glue 
                                'glue:*',

                            ],
                            resources: ['*']
                        })
                    ]
                }),
            },
        });

        this.queryFunction = new lambda.Function(this, 'TimestreamQueryFunction', {
            functionName: "Timestream-Query",
            code: new lambda.AssetCode('build/src'),
            handler: 'timestream-query.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: this.lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(300),
            securityGroups: [
                vpcStack.lambdaSecurityGroup
            ],
            vpc: vpcStack.vpc,
            vpcSubnets: vpcStack.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }),
        });

        this.simulateFunction = new lambda.Function(this, 'SimulateFunction', {
            functionName: "Simulate",
            code: new lambda.AssetCode('build/src'),
            handler: 'simulate.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: this.lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(300),
            securityGroups: [
                vpcStack.lambdaSecurityGroup
            ],
            vpc: vpcStack.vpc,
            vpcSubnets: vpcStack.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }),
        });

        this.athenaS3QueryFunction = new lambda.Function(this, 'AthenaS3QueryFunction', {
            functionName: "AthenaS3Query",
            handler: 'athena-patient-S3query.handler',
            code: new lambda.AssetCode('build/src'),
            runtime: lambda.Runtime.NODEJS_14_X,
            role: this.lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(300)
        });

    }
}

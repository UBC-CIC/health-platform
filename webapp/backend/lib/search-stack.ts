import cdk = require('@aws-cdk/core');
import * as opensearch from '@aws-cdk/aws-opensearchservice';
import * as lambda from "@aws-cdk/aws-lambda";
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement, Effect } from '@aws-cdk/aws-iam';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import dynamodb = require('aws-sdk/clients/dynamodb');
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { ITable } from '@aws-cdk/aws-dynamodb';


export class HealthPlatformSearchStack extends cdk.Stack {
    public readonly lambdaRole: Role;
    public readonly deliveryFunction: lambda.Function;

    constructor(app: cdk.App, id: string, sourceTable: ITable) {
        super(app, id, {
            env: {
                region: 'us-west-2'
            },
        });

        // configuration for prototyping, not suitable for production
        const devDomain = new opensearch.Domain(this, 'HealthPlatformDomain', {
            version: opensearch.EngineVersion.OPENSEARCH_1_1,
            enableVersionUpgrade: true,
            capacity: {
                dataNodes: 1,
                dataNodeInstanceType: "t2.small.search"
              },
            //   ebs: {
            //     volumeSize: 2,
            //   },
            // logging: {
            // slowSearchLogEnabled: true,
            // appLogEnabled: true,
            // slowIndexLogEnabled: true,
            // },
        });

        this.lambdaRole = new Role(this, 'HealthPlatformSearchLambdaRole', {
            roleName: 'HealthPlatformSearchLambdaRole',
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            inlinePolicies: {
                additional: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            effect: Effect.ALLOW,
                            actions: [
                                "es:ESHttpPost",
                                "es:ESHttpPut",
                                "dynamodb:DescribeStream",
                                "dynamodb:GetRecords",
                                "dynamodb:GetShardIterator",
                                "dynamodb:ListStreams",
                                "logs:CreateLogGroup",
                                "logs:CreateLogStream",
                                "logs:PutLogEvents",
                                // STS
                                'sts:AssumeRole',
                            ],
                            resources: ['*']
                        })
                    ]
                }),
            },
        });

        this.deliveryFunction = new lambda.Function(this, 'HealthPlatformIndexerLambda', {
            functionName: "DynamoDbstream-Indexer",
            code: new lambda.AssetCode('build/src'),
            handler: 'ddb-to-opensearch.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: this.lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(300), 
            environment: {
                "ROLE_ARN": this.lambdaRole.roleArn,
                "OPENSEARCH_ENDPOINT": devDomain.domainEndpoint,
            }
        });
        this.deliveryFunction.addEventSource(new DynamoEventSource(sourceTable, {
            startingPosition: StartingPosition.LATEST
        }));    
    
    }
}
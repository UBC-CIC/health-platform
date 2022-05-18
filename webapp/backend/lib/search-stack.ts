import cdk = require('@aws-cdk/core');
import { ITable } from '@aws-cdk/aws-dynamodb';
import { ArnPrincipal, Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import * as lambda from "@aws-cdk/aws-lambda";
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Domain, EngineVersion } from '@aws-cdk/aws-opensearchservice';
import { Bucket } from '@aws-cdk/aws-s3';

export class HealthPlatformSearchStack extends cdk.Stack {
    public readonly deliveryFunction: lambda.Function;
    public readonly searchFunction: lambda.Function;
    public readonly bucket: Bucket;
    public readonly devDomain: Domain;


    constructor(app: cdk.App, id: string, sourceTable: ITable) {
        super(app, id, {
            env: {
                region: 'us-west-2'
            },
        });

        const domainName = 'health-platform-dev-domain'

        const lambdaRole = new Role(this, 'HealthPlatformSearchLambdaRole', {
            roleName: 'HealthPlatformSearchLambdaRole',
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            inlinePolicies: {
                additional: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            effect: Effect.ALLOW,
                            actions: [
                                "es:*",
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

        const openSearchPolicyStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['es:ESHttp*'],
            principals: [
                new ArnPrincipal(lambdaRole.roleArn),
            ],
            resources: [
                `arn:aws:es:us-west-2:022810127093:domain/${domainName}`,
            ],
        });

        // configuration for prototyping, not suitable for production
        this.devDomain = new Domain(this, 'HealthPlatformDomain', {
            version: EngineVersion.OPENSEARCH_1_1,
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
            accessPolicies: [openSearchPolicyStatement],
        });

        this.deliveryFunction = new lambda.Function(this, 'HealthPlatformIndexerLambda', {
            functionName: "EventOpenSearch-Indexer",
            code: new lambda.AssetCode('build/src'),
            handler: 'eventsearch-indexer.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(300),
            environment: {
                "ROLE_ARN": lambdaRole.roleArn,
                "OPENSEARCH_ENDPOINT": this.devDomain.domainEndpoint,
            }
        });
        this.deliveryFunction.addEventSource(new DynamoEventSource(sourceTable, {
            startingPosition: StartingPosition.LATEST
        }));

        this.searchFunction = new lambda.Function(this, 'HealthPlatformQueryLambda', {
            functionName: "EventOpenSearch-Query",
            code: new lambda.AssetCode('build/src'),
            handler: 'eventsearch-search.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(300),
            environment: {
                "ROLE_ARN": lambdaRole.roleArn,
                "OPENSEARCH_ENDPOINT": this.devDomain.domainEndpoint,
            }
        });

        this.devDomain.grantRead(new ArnPrincipal(lambdaRole.roleArn))
        this.devDomain.node.addDependency(lambdaRole);

    }
}
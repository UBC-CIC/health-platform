import cdk = require('@aws-cdk/core');
import { ITable } from '@aws-cdk/aws-dynamodb';
import { ArnPrincipal, Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import * as lambda from "@aws-cdk/aws-lambda";
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Domain, EngineVersion } from '@aws-cdk/aws-opensearchservice';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { HealthPlatformVpcStack } from './vpc-stack';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import { CfnTable, Database } from '@aws-cdk/aws-glue';
import { CfnDeliveryStream } from '@aws-cdk/aws-kinesisfirehose';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';

export class HealthPlatformSearchStack extends cdk.Stack {
    public readonly deliveryFunction: lambda.Function;
    public readonly searchFunction: lambda.Function;
    public readonly bucket: Bucket;
    public readonly devDomain: Domain;

    private static PARQUET_EVENTS_PREFIX = "health-platform-events-"
    private static EVENTS_GLUE_TABLE_NAME = "health-platform-events-glue-table"


    constructor(app: cdk.App, id: string, sourceTable: ITable, vpcStack: HealthPlatformVpcStack) {
        super(app, id, {
            env: {
                region: 'us-west-2'
            },
        });

        const domainName = 'health-platform-domain'

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
                                // VPC
                                'ec2:CreateNetworkInterface',
                                'ec2:Describe*',
                                'ec2:DeleteNetworkInterface',
                                //Kinesis
                                "firehose:PutRecord",
                                "firehose:PutRecordBatch",
                            ],
                            resources: ['*']
                        })
                    ]
                }),
            },
        });

        const openSearchVPCPermissions = new iam.CfnServiceLinkedRole(this, 'OpenSearchVPC', {
            awsServiceName: 'opensearchservice.amazonaws.com'
        });

        const openSearchPolicyStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['es:ESHttp*'],
            principals: [
                new ArnPrincipal(lambdaRole.roleArn),
            ],
            resources: [
                `arn:aws:es:us-west-2:${this.account}:domain/${domainName}`,
            ],
        });

        this.devDomain = new Domain(this, 'HealthPlatformDomain', {
            version: EngineVersion.OPENSEARCH_1_1,
            enableVersionUpgrade: true,
            capacity: {
                dataNodes: 2,
                dataNodeInstanceType: "t2.small.search"
            },
            domainName: domainName,
            accessPolicies: [openSearchPolicyStatement],
            vpc: vpcStack.vpc, 
            vpcSubnets: [vpcStack.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED })],
            securityGroups: [
                vpcStack.lambdaSecurityGroup
            ],
            zoneAwareness: {availabilityZoneCount : 2}
        });

        //Attach vpc service linked role to opensearch domain
        this.devDomain.node.addDependency(openSearchVPCPermissions)

        let kinesisLogGroup = new LogGroup(this, "HealthPlatformEventsKinesisLogGroup", {
            retention: RetentionDays.ONE_MONTH,
        });

        let parquetMetricsBucket = new Bucket(this, 'HealthPlatformParquetEventsBucket', {
            bucketName: HealthPlatformSearchStack.PARQUET_EVENTS_PREFIX + this.account,
            encryption: BucketEncryption.S3_MANAGED,
        });

        let parquetDeliveryStreamRole = new Role(this, 'HealthPlatformEventsDeliveryStreamRole', {
            roleName: 'HealthPlatformEventsDeliveryStreamRole',
            assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
            path: "/",
            inlinePolicies: {
                additional: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            effect: Effect.ALLOW,
                            actions: [
                                's3:AbortMultipartUpload',
                                's3:GetBucketLocation',
                                's3:GetObject',
                                's3:PutObject',
                                's3:ListBucket',
                                's3:ListBucketMultipartUploads',
                            ],
                            resources: [
                                parquetMetricsBucket.bucketArn,
                                `${parquetMetricsBucket.bucketArn}/`,
                                `${parquetMetricsBucket.bucketArn}/*`,
                            ]
                        }),
                        new PolicyStatement({
                            effect: Effect.ALLOW,
                            actions: [
                                'glue:GetTableVersions',
                            ],
                            resources: ['*']
                        }),
                        new PolicyStatement({
                            effect: Effect.ALLOW,
                            actions: [
                                'logs:CreateLogGroup',
                                'logs:CreateLogStream',
                                'logs:PutDestination',
                                'logs:PutLogEvents',
                            ],
                            resources: ['*']
                        })
                    ]
                }),
            },
        });

        let glueDatabase = new Database(this, 'HealthPlatformEventsGlueDatabase', {
            databaseName: 'health-platform-events-glue-db',
        });

        let glueTable = new CfnTable(this, 'HealthPlatformEventsGlueTable', {
            databaseName: glueDatabase.databaseName,
            catalogId: this.account,
            tableInput: {
                name: HealthPlatformSearchStack.EVENTS_GLUE_TABLE_NAME,
                owner: "owner",
                retention: 0,
                storageDescriptor: {
                    columns: [
                        {'name': 'patient_id', 'type': 'string'},
                        {'name': 'event_id', 'type': 'string'},
                        {'name': 'mood', 'type': 'string'},
                        {'name': 'medication', 'type': 'string'},
                        {'name': 'food', 'type': 'string'},
                        {'name': 'timestamp', 'type': 'string'},
                    ],
                    inputFormat: "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat",
                    outputFormat: "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat",
                    compressed: false,
                    numberOfBuckets: -1,
                    serdeInfo: {
                        serializationLibrary: "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe",
                        parameters: {
                            "serialization.format": "1",
                        }
                    },
                    bucketColumns: [],
                    sortColumns: [],
                    storedAsSubDirectories: false,
                },
                partitionKeys: [
                    {'name': 'year', 'type': 'string'},
                    {'name': 'month', 'type': 'string'},
                    {'name': 'day', 'type': 'string'},
                ],
                tableType: "EXTERNAL_TABLE",
            },
        });

        let parquetDeliveryStream = new CfnDeliveryStream(this, 'HealthPlatformEventsDeliveryStream', {
            deliveryStreamName: "HealthPlatformEventsDeliveryStream",
            extendedS3DestinationConfiguration: {
                bucketArn: parquetMetricsBucket.bucketArn,
                bufferingHints: {
                    intervalInSeconds: 60,
                    sizeInMBs: 64
                },
                cloudWatchLoggingOptions: {
                    enabled: true,
                    logStreamName: 'ParquetS3Delivery',
                    logGroupName: kinesisLogGroup.logGroupName
                },
                compressionFormat: 'UNCOMPRESSED',
                encryptionConfiguration: {
                    noEncryptionConfig: 'NoEncryption',
                },
                prefix: 'data/year=!{timestamp:YYYY}/month=!{timestamp:MM}/day=!{timestamp:dd}/hour=!{timestamp:HH}/',
                errorOutputPrefix: 'error/!{firehose:error-output-type}/year=!{timestamp:YYYY}/month=!{timestamp:MM}/day=!{timestamp:dd}/hour=!{timestamp:HH}/',
                roleArn: parquetDeliveryStreamRole.roleArn,
                dataFormatConversionConfiguration: {
                    enabled: true,
                    inputFormatConfiguration: {
                        deserializer: {
                            openXJsonSerDe: {}
                        }
                    },
                    outputFormatConfiguration: {
                        serializer: {
                            parquetSerDe: {}
                        }
                    },
                    schemaConfiguration: {
                        catalogId: this.account,
                        databaseName: glueDatabase.databaseName,
                        region: this.region,
                        tableName: HealthPlatformSearchStack.EVENTS_GLUE_TABLE_NAME,
                        roleArn: parquetDeliveryStreamRole.roleArn,
                        versionId: "LATEST",
                    }
                },
            }
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
                "DELIVERY_STREAM_NAME": parquetDeliveryStream.deliveryStreamName!,
            },
            securityGroups: [
                vpcStack.lambdaSecurityGroup
            ],
            vpc: vpcStack.vpc, 
            vpcSubnets: vpcStack.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }),
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
            },
            securityGroups: [
                vpcStack.lambdaSecurityGroup
            ],
            vpc: vpcStack.vpc, 
            vpcSubnets: vpcStack.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }),
        });

        this.devDomain.grantRead(new ArnPrincipal(lambdaRole.roleArn))
        this.devDomain.node.addDependency(lambdaRole);

    }
}
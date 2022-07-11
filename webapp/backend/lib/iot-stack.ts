import cdk = require('@aws-cdk/core');
import * as ec2 from '@aws-cdk/aws-ec2';
import { CfnTable, Database } from '@aws-cdk/aws-glue';
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal, ManagedPolicy, FederatedPrincipal } from '@aws-cdk/aws-iam';
import { IotSql, TopicRule } from '@aws-cdk/aws-iot';
import { LambdaFunctionAction } from '@aws-cdk/aws-iot-actions';
import { CfnDeliveryStream } from '@aws-cdk/aws-kinesisfirehose';
import * as lambda from "@aws-cdk/aws-lambda";
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { HealthPlatformDynamoStack } from './dynamodb-stack';
import { CfnIdentityPool, CfnIdentityPoolRoleAttachment } from '@aws-cdk/aws-cognito';
import * as timestream from '@aws-cdk/aws-timestream';
import * as iot from '@aws-cdk/aws-iot';
import { Duration } from '@aws-cdk/core';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { HealthPlatformVpcStack } from './vpc-stack';
import * as glue from '@aws-cdk/aws-glue';
import { HealthPlatformSearchStack } from './search-stack';


// This stack contains resources used by the IoT data flow.

export class HealthPlatformIotStack extends cdk.Stack {

    private static GLUE_TABLE_NAME = "health-platform-glue-table"
    private static PARQUET_METRICS_PREFIX = "health-platform-metrics-"
    private static TIMESTREAM_REJECTED_DATA_PREFIX = "health-platform-rejected-data-"
    private static EXPORT_DATA_PREFIX = "health-platform-metrics-patient-export-"
    private static EXPORT_EVENT_DATA_PREFIX = "health-platform-metrics-events-export-"


    public readonly lambdaRole: Role;

    constructor(app: cdk.App, id: string, vpcStack: HealthPlatformVpcStack, searchStack: HealthPlatformSearchStack) {
        super(app, id, {
            env: {
                region: 'us-west-2'
            },
        });
        
        this.lambdaRole = new Role(this, 'HealthPlatformBackendIotLambdaRole', {
            roleName: 'HealthPlatformBackendIotLambdaRole',
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            inlinePolicies: {
                additional: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            effect: Effect.ALLOW,
                            actions: [
                                // TimeStream
                                "timestream:WriteRecords",
                                "timestream:DescribeEndpoints",
                                "timestream:DescribeTable",
                                "timestream:ListDatabases",
                                "timestream:ListMeasures",
                                // DynamoDB
                                "dynamodb:GetItem",
                                "dynamodb:DeleteItem",
                                "dynamodb:PutItem",
                                "dynamodb:Scan",
                                "dynamodb:Query",
                                "dynamodb:UpdateItem",
                                "dynamodb:BatchWriteItem",
                                "dynamodb:BatchGetItem",
                                "dynamodb:DescribeTable",
                                "dynamodb:ConditionCheckItem",
                                // IAM
                                'iam:GetRole',
                                'iam:PassRole',
                                // Firehose
                                "firehose:PutRecord",
                                "firehose:PutRecordBatch",
                                // Lambda
                                'lambda:InvokeFunction',
                                // STS
                                'sts:AssumeRole',
                                // CloudWatch
                                'cloudwatch:*',
                                'logs:*',
                                // VPC
                                'ec2:CreateNetworkInterface',
                                'ec2:Describe*',
                                'ec2:DeleteNetworkInterface',
                            ],
                            resources: ['*']
                        })
                    ]
                }),
            },
        });

        const cfnPolicy = new iot.CfnPolicy(this, 'HealthPlatformIotPolicy', {
            policyDocument: {
                "Version": "2012-10-17",
                "Statement": [
                  {
                    "Effect": "Allow",
                    "Action": "iot:Connect",
                    "Resource": "*"
                  },
                  {
                    "Effect": "Allow",
                    "Action": [
                      "iot:Publish",
                      "iot:Subscribe",
                      "iot:Receive"
                    ],
                    "Resource": "*"
                  }
                ]
              },
            policyName: 'HealthPlatformIotPolicy',
          });

        const cognitoIdentityPool = new CfnIdentityPool(this, 'HealthPlatformIdentityPool', {
            identityPoolName: 'HealthPlatformIdentityPool',
            allowUnauthenticatedIdentities: true,
        });

        const cognitoUnauthourizedRole = new Role(this, 'CognitoUnauthourizedRole', {
            roleName: "CognitoUnauthourizedRole",
            assumedBy: new FederatedPrincipal(
                "cognito-identity.amazonaws.com",
                {
                    StringEquals: {
                        "cognito-identity.amazonaws.com:aud": cognitoIdentityPool.ref
                    },
                    "ForAnyValue:StringLike": {
                        "cognito-identity.amazonaws.com:amr": "unauthenticated"
                    }
                },
                "sts:AssumeRoleWithWebIdentity"
            ),
            description: 'Role for sensor devices',
            maxSessionDuration: cdk.Duration.seconds(3600),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName("AWSIoTFullAccess")
            ]
        }); 
        
        cognitoUnauthourizedRole.addToPolicy(new PolicyStatement( {
            effect: Effect.ALLOW,
            resources: ["*"],
            actions: [
                "mobileanalytics:PutEvents",
                "cognito-sync:*"
            ]
        }));

        const identityPoolRoleAttachment = new CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleMapping', {
            identityPoolId: cognitoIdentityPool.ref,
            roles: {
                unauthenticated: cognitoUnauthourizedRole.roleArn
            }
        });

        const healthDatabase = new timestream.CfnDatabase(this, 'HealthDatabase',  {
            databaseName: 'HealthDatabase',
        });

        let timestreamRejectedDataBucket = new Bucket(this, 'TimestreamRejectedDataBucket', {
            bucketName: HealthPlatformIotStack.TIMESTREAM_REJECTED_DATA_PREFIX + this.account,
            encryption: BucketEncryption.S3_MANAGED,
        });

        let patientExportDataQueryResults = new Bucket(this, 'ExportDataQueryBucket', {
            bucketName: HealthPlatformIotStack.EXPORT_DATA_PREFIX + this.account,
            encryption: BucketEncryption.S3_MANAGED,
        });

        let patientExportEventDataQueryResults = new Bucket(this, 'ExportEventDataQueryBucket', {
            bucketName: HealthPlatformIotStack.EXPORT_EVENT_DATA_PREFIX + this.account,
            encryption: BucketEncryption.S3_MANAGED,
        });

        const dataTable = new cdk.CfnResource(this, 'HealthMetricsData', {
            type: 'AWS::Timestream::Table',
            properties: {
                DatabaseName: healthDatabase.ref,
                MagneticStoreWriteProperties: {
                    EnableMagneticStoreWrites : true,
                    MagneticStoreRejectedDataLocation : {
                        S3Configuration : {
                            BucketName : timestreamRejectedDataBucket.bucketName,
                            EncryptionOption : "SSE_S3"
                        } 
                    }
                },
                RetentionProperties: {
                    MemoryStoreRetentionPeriodInHours : "2160",
                    MagneticStoreRetentionPeriodInDays : "365"
                },
                TableName: 'HealthMetricsData',
            },
        });

        let kinesisLogGroup = new LogGroup(this, "HealthPlatformKinesisLogGroup", {
            retention: RetentionDays.ONE_MONTH,
        });

        let parquetMetricsBucket = new Bucket(this, 'HealthPlatformParquetMetricsBucket', {
            bucketName: HealthPlatformIotStack.PARQUET_METRICS_PREFIX + this.account,
            encryption: BucketEncryption.S3_MANAGED,
        });

        let parquetDeliveryStreamRole = new Role(this, 'HealthPlatformDeliveryStreamRole', {
            roleName: 'HealthPlatformDeliveryStreamRole',
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

        let glueDatabase = new Database(this, 'HealthPlatformGlueDatabase', {
            databaseName: 'health-platform-glue-db',
        });

        let glueTable = new CfnTable(this, 'HealthPlatformGlueTable', {
            databaseName: glueDatabase.databaseName,
            catalogId: this.account,
            tableInput: {
                name: HealthPlatformIotStack.GLUE_TABLE_NAME,
                owner: "owner",
                retention: 0,
                storageDescriptor: {
                    columns: [
                        {'name': 'patientId', 'type': 'string'},
                        {'name': 'sensorId', 'type': 'string'},
                        {'name': 'measurementType', 'type': 'string'},
                        {'name': 'measurement', 'type': 'string'},
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

        let parquetDeliveryStream = new CfnDeliveryStream(this, 'HealthPlatformDeliveryStream', {
            deliveryStreamName: "HealthPlatformDeliveryStream",
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
                        tableName: HealthPlatformIotStack.GLUE_TABLE_NAME,
                        roleArn: parquetDeliveryStreamRole.roleArn,
                        versionId: "LATEST",
                    }
                },
            }
        });

        const layer = new lambda.LayerVersion(this, 'health-platform-layer', {
            code: lambda.Code.fromAsset(`layer/nodejs.zip`),
            compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
         });

        const eventHandlerFunction = new lambda.Function(this, 'EventHandlerFunction', {
            functionName: "Event-Handler-Function",
            code: new lambda.AssetCode('build/src'),
            handler: 'event-handler.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: this.lambdaRole,
            environment: {
                // "DATA_TABLE_NAME": HealthPlatformDynamoStack.DATA_TABLE,
                "SENSOR_MAPPING_TABLE_NAME": HealthPlatformDynamoStack.SENSOR_TABLE,
                "DELIVERY_STREAM_NAME": parquetDeliveryStream.deliveryStreamName!,
            },
            memorySize: 512,
            timeout: cdk.Duration.seconds(300),
            layers: [layer],
            securityGroups: [
                vpcStack.lambdaSecurityGroup
            ],
            vpc: vpcStack.vpc, 
            vpcSubnets: vpcStack.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }),
        });

        new lambda.Function(this, 'GenerateDataFunction', {
            functionName: "Generate-Data-Function",
            code: new lambda.AssetCode('build/src'),
            handler: 'generate-data.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: this.lambdaRole,
            environment: {
                // "DATA_TABLE_NAME": HealthPlatformDynamoStack.DATA_TABLE,
                "SENSOR_MAPPING_TABLE_NAME": HealthPlatformDynamoStack.SENSOR_TABLE,
                "DELIVERY_STREAM_NAME": parquetDeliveryStream.deliveryStreamName!,
            },
            memorySize: 512,
            timeout: cdk.Duration.seconds(300),
            securityGroups: [
                vpcStack.lambdaSecurityGroup
            ],
            // vpc: vpcStack.vpc, //Internet Gateway required for DynamoDB query, can be expensive
            vpcSubnets: vpcStack.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }),
        });

        const externalSensorLambdaFunction = new lambda.Function(this, 'ExternalSensorFunction', {
            functionName: "External-Sensor-Function",
            code: new lambda.AssetCode('build/src'),
            handler: 'external-sensor-handler.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: this.lambdaRole,
            environment: {
                "SENSOR_MAPPING_TABLE_NAME": HealthPlatformDynamoStack.SENSOR_TABLE,
                "DELIVERY_STREAM_NAME": parquetDeliveryStream.deliveryStreamName!,
            },
            memorySize: 512,
            timeout: cdk.Duration.seconds(300),
            deadLetterQueueEnabled: true,
            securityGroups: [
                vpcStack.lambdaSecurityGroup
            ],
            // Vpc Interupts Airthings api calls, API Gateway needed
            // vpc: vpcStack.vpc,
            // vpcSubnets: vpcStack.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }),
        });

        // Scheduled CloudWatch jobs
        var dailyLambdaSchedule = Schedule.rate(Duration.minutes(5));
        const externalSensorLambdaTarget = new LambdaFunction(externalSensorLambdaFunction);
        new Rule(this, 'ScheduledRules', {
            schedule: dailyLambdaSchedule,
            targets: [
                externalSensorLambdaTarget,
            ]
        });

        const biostrapLambdaFunction = new lambda.Function(this, 'BiostrapSensorFunction', {
            functionName: "Biostrap-Sensor-Function",
            code: new lambda.AssetCode('build/src'),
            handler: 'biostrap-sensor-handler.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            role: this.lambdaRole,
            environment: {
                "SENSOR_MAPPING_TABLE_NAME": HealthPlatformDynamoStack.SENSOR_TABLE,
                "DELIVERY_STREAM_NAME": parquetDeliveryStream.deliveryStreamName!,
            },
            memorySize: 512,
            timeout: cdk.Duration.seconds(300),
            deadLetterQueueEnabled: true,
            securityGroups: [
                vpcStack.lambdaSecurityGroup
            ],
            // Vpc Interupts Biostrap api calls, API Gateway needed
            // vpc: vpcStack.vpc,
            // vpcSubnets: vpcStack.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }),
        });

        // Scheduled CloudWatch jobs
        var dailyLambdaSchedule = Schedule.rate(Duration.minutes(5));
        const biostrapLambdaTarget = new LambdaFunction(biostrapLambdaFunction);
        new Rule(this, 'BiostrapScheduledRules', {
            schedule: dailyLambdaSchedule,
            targets: [
                biostrapLambdaTarget,
            ]
        });
        
        let iotTopicRule = new TopicRule(this, 'IoTTopicRule', {
            topicRuleName: "TopicRulePayload",
            description: "Send IoT Device data in raw format to Kinesis Analytics",
            enabled: true,
            sql: IotSql.fromStringAsVer20160323('SELECT * FROM "iot_device_analytics"'),
            actions: [
                new LambdaFunctionAction(eventHandlerFunction),
            ],
        });

        new lambda.CfnPermission(this, 'IoTRuleLambdaPermission', {
            action: "lambda:InvokeFunction",
            principal: "iot.amazonaws.com",
            sourceArn: iotTopicRule.topicRuleArn,
            sourceAccount: this.account,
            functionName: eventHandlerFunction.functionArn,
        });
        
        const patientDB = new glue.Database(this, "S3-Health-Glue-Table", {
            databaseName: "patient-export-db",
          });

          new glue.Table(this, "PatientDataTable", {
            database: patientDB,
            tableName: "patient-export-data",
            bucket: parquetMetricsBucket,
            columns: [
              {
                name: "patientid",
                type: glue.Schema.STRING,
              },
              {
                name: "sensorid",
                type: glue.Schema.STRING,
              },
              {
                name: "timestamp",
                type: glue.Schema.STRING,
              },
              {
                name: "measurementtype",
                type: glue.Schema.STRING,

              },
              {
                name: "measurement",
                type: glue.Schema.STRING,
              },

            ],
            dataFormat: glue.DataFormat.PARQUET,
            s3Prefix: 'data/'
          });

          new glue.Table(this, "PatientEventDataTable", {
            database: patientDB,
            tableName: "patient-export-event-data",
            bucket: searchStack.parquetMetricsBucket,
            columns: [
              {
                name: "patient_id",
                type: glue.Schema.STRING,
              },
              {
                name: "event_id",
                type: glue.Schema.STRING,
              },
              {
                name: "mood",
                type: glue.Schema.STRING,
              },
              {
                name: "medication",
                type: glue.Schema.STRING,

              },
              {
                name: "food",
                type: glue.Schema.STRING,
              },
              {
                name: "timestamp",
                type: glue.Schema.STRING,
              },

            ],
            dataFormat: glue.DataFormat.PARQUET,
          });
    }

}

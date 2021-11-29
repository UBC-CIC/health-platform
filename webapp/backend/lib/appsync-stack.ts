import { CfnOutput, Construct, Stack } from '@aws-cdk/core';
import {
    AuthorizationType,
    FieldLogLevel,
    GraphqlApi,
    MappingTemplate,
    Schema,
    UserPoolDefaultAction
} from '@aws-cdk/aws-appsync';
import { UserPool } from '@aws-cdk/aws-cognito';
import { Table } from '@aws-cdk/aws-dynamodb';
import { CompositePrincipal, ManagedPolicy, Role, PolicyDocument, ServicePrincipal, Effect, PolicyStatement } from '@aws-cdk/aws-iam'
import { HealthPlatformDynamoStack } from './dynamodb-stack';
import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');

/**
 * HealthPlatformAppSyncStack defines a GraphQL API for accessing meeting-detail table.
 *
 */
export class HealthPlatformAppSyncStack extends Stack {
    public readonly GraphQLUrl: string;

    constructor(scope: Construct, id: string, userPoolId: string) {
        super(scope, id, {
            env: {
                region: 'ca-central-1'
            },
        });

        const meetingDetailResolverPath = './vtl/resolvers/meeting-detail'

        const authorizationType = AuthorizationType.USER_POOL;
        const userPool = UserPool.fromUserPoolId(this, 'UserPool', userPoolId);
        const api = new GraphqlApi(this, 'healthPlatformAdminsGraphQLAPI', {
            name: 'healthPlatformAdminsGraphQLAPI',
            schema: Schema.fromAsset('src/common/graphql/schema.graphql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: authorizationType,
                    userPoolConfig: {
                        userPool: userPool,
                        defaultAction: UserPoolDefaultAction.ALLOW,
                    }
                },
                additionalAuthorizationModes: [{
                    authorizationType: AuthorizationType.IAM,
                }],
            },
            xrayEnabled: true,
            logConfig: {
                fieldLogLevel: FieldLogLevel.ALL,
            },
        });
        this.GraphQLUrl = api.graphqlUrl

        // Create AppSyncRole
        const healthPlatformAdminAppSyncRole = new Role(this, 'healthPlatformAdminAppSyncRole', {
            roleName: 'health-platform-app-sync-role',
            assumedBy: new CompositePrincipal(new ServicePrincipal('appsync.amazonaws.com'),
                new ServicePrincipal('lambda.amazonaws.com')),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
                ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
                ManagedPolicy.fromAwsManagedPolicyName('AWSAppSyncInvokeFullAccess')
            ]
        });
        healthPlatformAdminAppSyncRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'sts:AssumeRole'
            ],
            resources: ['*']
        }))

        // DynamoDB DataSource

        // DataSource to connect to meeting-detail DDB table
        // Import meeting-detail DDB table and grant AppSync to access the DDB table
        const meetingDetailTable = Table.fromTableAttributes(this,
            'meetingDetailTable', {
            tableName: HealthPlatformDynamoStack.MEETING_DETAIL_TABLE_NAME,
            globalIndexes: [HealthPlatformDynamoStack.MEETING_STATUS_GLOBAL_INDEX_NAME]
        });
        meetingDetailTable.grantFullAccess(healthPlatformAdminAppSyncRole);

        // Define Request DDB DataSource
        const meetingDetailTableDataSource = api.addDynamoDbDataSource('meetingDetailTableDataSource', meetingDetailTable);

        meetingDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetail.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'listMeetingDetails',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.listMeetingDetails.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.listMeetingDetails.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getMeetingDetailsByStatus',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetailsByStatus.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetailsByStatus.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getMeetingDetailsByStatusAndCreateTime',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetailsByStatusAndCreateTime.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetailsByStatusAndCreateTime.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'createMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.createMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.createMeetingDetail.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'deleteMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.deleteMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.deleteMeetingDetail.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'updateMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.updateMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.updateMeetingDetail.res.vtl`),
        });

        // None DataSource
        //
        // Add None DataSource for Local Resolver - to publish notification triggered by meeting-detail DDB
        const newMeetingDetailNoneDataSource = api.addNoneDataSource('NewMeetingDetailNoneDataSource');
        newMeetingDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishNewMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/None.publishNewMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/None.publishNewMeetingDetail.res.vtl`)
        });
        const meetingDetailNoneDataSource = api.addNoneDataSource('MeetingDetailNoneDataSource');
        meetingDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishMeetingDetailUpdates',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/None.publishMeetingDetailUpdates.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/None.publishMeetingDetailUpdates.res.vtl`)
        });

        // Define Lambda Role and Data Source
        const lambdaRole = new Role(this, 'HealthPlatformAppSyncLambdaRole', {
            roleName: 'HealthPlatformAppSyncLambdaRole',
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
                                // SES
                                'ses:*',
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

        const endMeetingFunction = new lambda.Function(this, 'endMeetingFunction', {
            functionName: "HealthPlatform-Data-ChimeMeeting-End",
            code: new lambda.AssetCode('build/src'),
            handler: 'data-cleanup.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            environment: {
                TABLE_NAME: HealthPlatformDynamoStack.MEETING_DETAIL_TABLE_NAME,
                PRIMARY_KEY: 'meeting_id',
            },
            role: lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(30)
        });

        // Define Lambda DataSource and Resolver - make sure mutations are defined in schema.graphql
        //
        // Resolver for Chime meeting operations
        api.addLambdaDataSource('EndMeetingDataSource', endMeetingFunction).createResolver({
            typeName: 'Mutation',
            fieldName: 'endMeeting'
        });

        // Cloudformation Output
        new CfnOutput(this, "GraphQLEndpoint", {
            value: api.graphqlUrl
        });

        new CfnOutput(this, "GraphQLAuthorizationType", {
            value: authorizationType
        });
    }
}
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
import { HealthPlatformLambdaStack } from './lambda-stack';

/**
 * HealthPlatformAppSyncStack defines a GraphQL API for accessing event-detail table.
 *
 */
export class HealthPlatformAppSyncStack extends Stack {
    public readonly GraphQLUrl: string;

    constructor(scope: Construct, id: string, userPoolId: string, lambdaStack: HealthPlatformLambdaStack) {
        super(scope, id, {
            env: {
                region: 'ca-central-1'
            },
        });

        const eventDetailResolverPath = './vtl/resolvers/event-detail'

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

        // DataSource to connect to event-detail DDB table
        // Import event-detail DDB table and grant AppSync to access the DDB table
        const eventDetailTable = Table.fromTableAttributes(this,
            'eventDetailTable', {
            tableName: HealthPlatformDynamoStack.EVENT_DETAIL_TABLE_NAME,
            globalIndexes: [HealthPlatformDynamoStack.EVENT_STATUS_GLOBAL_INDEX_NAME]
        });
        eventDetailTable.grantFullAccess(healthPlatformAdminAppSyncRole);

        // Define Request DDB DataSource
        const eventDetailTableDataSource = api.addDynamoDbDataSource('eventDetailTableDataSource', eventDetailTable);

        eventDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getEventDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.getEventDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.getEventDetail.res.vtl`),
        });

        eventDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'listEventDetails',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.listEventDetails.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.listEventDetails.res.vtl`),
        });

        eventDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getEventDetailsByUser',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.getEventDetailsByUser.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.getEventDetailsByUser.res.vtl`),
        });

        eventDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getEventDetailsByUserAndCreateTime',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.getEventDetailsByUserAndCreateTime.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.getEventDetailsByUserAndCreateTime.res.vtl`),
        });

        eventDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'createEventDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Mutation.createEventDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Mutation.createEventDetail.res.vtl`),
        });

        eventDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'deleteEventDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Mutation.deleteEventDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Mutation.deleteEventDetail.res.vtl`),
        });

        eventDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'updateEventDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Mutation.updateEventDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Mutation.updateEventDetail.res.vtl`),
        });

        // None DataSource
        //
        // Add None DataSource for Local Resolver - to publish notification triggered by event-detail DDB
        const newEventDetailNoneDataSource = api.addNoneDataSource('NewEventDetailNoneDataSource');
        newEventDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishNewEventDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/None.publishNewEventDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/None.publishNewEventDetail.res.vtl`)
        });
        const meetingDetailNoneDataSource = api.addNoneDataSource('EventDetailNoneDataSource');
        meetingDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishEventDetailUpdates',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/None.publishEventDetailUpdates.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/None.publishEventDetailUpdates.res.vtl`)
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

        // Define Lambda DataSource and Resolver - make sure mutations are defined in schema.graphql
        //
        // Resolver for Chime meeting operations
        // api.addLambdaDataSource('QueryDataSource', lambdaStack.queryFunction).createResolver({
        //     typeName: 'Query',
        //     fieldName: 'query'
        // });

        // Cloudformation Output
        new CfnOutput(this, "GraphQLEndpoint", {
            value: api.graphqlUrl
        });

        new CfnOutput(this, "GraphQLAuthorizationType", {
            value: authorizationType
        });
    }
}
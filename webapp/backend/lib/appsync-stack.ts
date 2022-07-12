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
import { CompositePrincipal, Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { CfnOutput, Construct, Stack } from '@aws-cdk/core';
import { HealthPlatformDynamoStack } from './dynamodb-stack';
import { HealthPlatformLambdaStack } from './lambda-stack';
import { HealthPlatformSearchStack } from './search-stack';
import * as ssm from '@aws-cdk/aws-ssm';

/**
 * HealthPlatformAppSyncStack defines a GraphQL API for accessing DynamoDB table.
 *
 */
export class HealthPlatformAppSyncStack extends Stack {
    public readonly GraphQLUrl: string;
    public readonly api: GraphqlApi;

    constructor(scope: Construct, id: string, userPoolId: string, lambdaStack: HealthPlatformLambdaStack, searchStack: HealthPlatformSearchStack) {
        super(scope, id, {
            env: {
                region: 'us-west-2'
            },
        });

        const eventDetailResolverPath = './vtl/resolvers/event-detail'
        const patientsDetailResolverPath = './vtl/resolvers/patients-detail'
        const sensorsDetailResolverPath = './vtl/resolvers/sensors-detail'
        const usersDetailResolverPath = './vtl/resolvers/users-detail'

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

        //
        // CDK for the `event-detail` Table
        //

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
            typeName: 'Query',
            fieldName: 'getPatientEventEarliestDate',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.getEventPatientEarliestDate.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.getEventPatientEarliestDate.res.vtl`),
        });

        eventDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getPatientEventLatestDate',
            requestMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.getEventPatientLatestDate.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${eventDetailResolverPath}/Query.getEventPatientLatestDate.res.vtl`),
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

        //
        // CDK for the `patients` Table
        //

        // DataSource to connect to patients DDB table
        // Import patients DDB table and grant AppSync to access the DDB table
        const patientsDetailTable = Table.fromTableAttributes(this,
            'patientsDetailTable', {
            tableName: HealthPlatformDynamoStack.PATIENT_TABLE,
        });
        patientsDetailTable.grantFullAccess(healthPlatformAdminAppSyncRole);

        // Define Request DDB DataSource
        const patientsDetailTableDataSource = api.addDynamoDbDataSource('patientsDetailTableDataSource', patientsDetailTable);

        patientsDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getPatientsDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/Query.getPatientsDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/Query.getPatientsDetail.res.vtl`),
        });

        patientsDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'listPatientsDetails',
            requestMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/Query.listPatientsDetails.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/Query.listPatientsDetails.res.vtl`),
        });

        patientsDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'createPatientsDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/Mutation.createPatientsDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/Mutation.createPatientsDetail.res.vtl`),
        });

        patientsDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'deletePatientsDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/Mutation.deletePatientsDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/Mutation.deletePatientsDetail.res.vtl`),
        });

        patientsDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'updatePatientsDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/Mutation.updatePatientsDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/Mutation.updatePatientsDetail.res.vtl`),
        });

        // None DataSource
        //
        // Add None DataSource for Local Resolver - to publish notification triggered by patients DDB
        const newPatientsDetailNoneDataSource = api.addNoneDataSource('NewPatientsDetailNoneDataSource');
        newPatientsDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishNewPatientsDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/None.publishNewPatientsDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/None.publishNewPatientsDetail.res.vtl`)
        });
        const updatePatientsDetailNoneDataSource = api.addNoneDataSource('PatientsDetailNoneDataSource');
        updatePatientsDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishPatientsDetailUpdates',
            requestMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/None.publishPatientsDetailUpdates.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${patientsDetailResolverPath}/None.publishPatientsDetailUpdates.res.vtl`)
        });

        //
        // CDK for the `sensors` Table
        //

        // DataSource to connect to sensors DDB table
        // Import sensors DDB table and grant AppSync to access the DDB table
        const sensorsDetailTable = Table.fromTableAttributes(this,
            'sensorsDetailTable', {
            tableName: HealthPlatformDynamoStack.SENSOR_TABLE,
            globalIndexes: [HealthPlatformDynamoStack.SENSOR_PATIENT_GLOBAL_INDEX_NAME],
        });
        sensorsDetailTable.grantFullAccess(healthPlatformAdminAppSyncRole);

        // Define Request DDB DataSource
        const sensorsDetailTableDataSource = api.addDynamoDbDataSource('sensorsDetailTableDataSource', sensorsDetailTable);

        sensorsDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getSensorsDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Query.getSensorsDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Query.getSensorsDetail.res.vtl`),
        });

        sensorsDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getSensorsDetailByUser',
            requestMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Query.getSensorsDetailByUser.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Query.getSensorsDetailByUser.res.vtl`),
        });

        sensorsDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'listSensorsDetails',
            requestMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Query.listSensorsDetails.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Query.listSensorsDetails.res.vtl`),
        });

        sensorsDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'createSensorsDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Mutation.createSensorsDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Mutation.createSensorsDetail.res.vtl`),
        });

        sensorsDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'deleteSensorsDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Mutation.deleteSensorsDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Mutation.deleteSensorsDetail.res.vtl`),
        });

        sensorsDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'updateSensorsDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Mutation.updateSensorsDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/Mutation.updateSensorsDetail.res.vtl`),
        });

        // None DataSource
        //
        // Add None DataSource for Local Resolver - to publish notification triggered by sensors DDB
        const newSensorsDetailNoneDataSource = api.addNoneDataSource('NewSensorsDetailNoneDataSource');
        newSensorsDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishNewSensorsDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/None.publishNewSensorsDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/None.publishNewSensorsDetail.res.vtl`)
        });
        const updateSensorsDetailNoneDataSource = api.addNoneDataSource('SensorsDetailNoneDataSource');
        updateSensorsDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishSensorsDetailUpdates',
            requestMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/None.publishSensorsDetailUpdates.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${sensorsDetailResolverPath}/None.publishSensorsDetailUpdates.res.vtl`)
        });

        //
        // CDK for the `users` Table
        //

        // DataSource to connect to users DDB table
        // Import users DDB table and grant AppSync to access the DDB table
        const usersDetailTable = Table.fromTableAttributes(this,
            'usersDetailTable', {
            tableName: HealthPlatformDynamoStack.USER_TABLE,
        });
        usersDetailTable.grantFullAccess(healthPlatformAdminAppSyncRole);

        // Define Request DDB DataSource
        const usersDetailTableDataSource = api.addDynamoDbDataSource('usersDetailTableDataSource', usersDetailTable);

        usersDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getUsersDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/Query.getUsersDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/Query.getUsersDetail.res.vtl`),
        });

        usersDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'listUsersDetails',
            requestMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/Query.listUsersDetails.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/Query.listUsersDetails.res.vtl`),
        });

        usersDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'createUsersDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/Mutation.createUsersDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/Mutation.createUsersDetail.res.vtl`),
        });

        usersDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'deleteUsersDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/Mutation.deleteUsersDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/Mutation.deleteUsersDetail.res.vtl`),
        });

        usersDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'updateUsersDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/Mutation.updateUsersDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/Mutation.updateUsersDetail.res.vtl`),
        });

        // None DataSource
        //
        // Add None DataSource for Local Resolver - to publish notification triggered by users DDB
        const newUsersDetailNoneDataSource = api.addNoneDataSource('NewUsersDetailNoneDataSource');
        newUsersDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishNewUsersDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/None.publishNewUsersDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/None.publishNewUsersDetail.res.vtl`)
        });
        const updateUsersDetailNoneDataSource = api.addNoneDataSource('UsersDetailNoneDataSource');
        updateUsersDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishUsersDetailUpdates',
            requestMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/None.publishUsersDetailUpdates.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${usersDetailResolverPath}/None.publishUsersDetailUpdates.res.vtl`)
        });

        //
        // Lambda Connectivity
        //

        // Define Lambda DataSource and Resolver - make sure mutations are defined in schema.graphql
        //
        api.addLambdaDataSource('SimulateDataSource', lambdaStack.simulateFunction).createResolver({
            typeName: 'Mutation',
            fieldName: 'simulate'
        });

        // Define Lambda DataSource and Resolver - make sure mutations are defined in schema.graphql
        //
        api.addLambdaDataSource('QueryDataSource', lambdaStack.queryFunction).createResolver({
            typeName: 'Query',
            fieldName: 'query'
        });

        // Define Lambda DataSource and Resolver - make sure mutations are defined in schema.graphql
        //
        api.addLambdaDataSource('OpenSearchEventsDataSource', searchStack.searchFunction).createResolver({
            typeName: 'Query',
            fieldName: 'searchEvents'
        });

        api.addLambdaDataSource('AthenaS3QueryDataSource', lambdaStack.athenaS3QueryFunction).createResolver({
            typeName: 'Query',
            fieldName: 'getMessage'
        });

        api.addLambdaDataSource('TimeStreamMinMaxQueryDataSource', lambdaStack.queryPatientRangeFunction).createResolver({
            typeName: 'Query',
            fieldName: 'getPatientMinMaxRange'
        });

        // Cloudformation Output
        new CfnOutput(this, "GraphQLEndpoint", {
            value: api.graphqlUrl
        });

        new CfnOutput(this, "GraphQLAuthorizationType", {
            value: authorizationType
        });

        new ssm.StringParameter(this, 'AppSyncGraphQLEndpoint', {
            description: 'GraphQL Endpoint',
            parameterName: 'GraphQLEndpoint',
            stringValue: api.graphqlUrl
        }); 
    }
}

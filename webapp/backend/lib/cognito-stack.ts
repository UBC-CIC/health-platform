import { CfnOutput, Construct, Stack } from '@aws-cdk/core';
import {
    AccountRecovery,
    CfnIdentityPool,
    CfnIdentityPoolRoleAttachment,
    CfnUserPoolClient,
    DateTimeAttribute,
    UserPool,
    VerificationEmailStyle,
} from '@aws-cdk/aws-cognito';
import {
    Role,
    FederatedPrincipal,
    ManagedPolicy, 
    ServicePrincipal, 
    PolicyDocument, 
    PolicyStatement, 
    Effect 
} from '@aws-cdk/aws-iam';
import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');
import * as ssm from '@aws-cdk/aws-ssm';

/**
 * HealthPlatformCognitoStack defines a Cognito User and Identity Pool. The user pool will be used for authenticating
 * users into Health Platform Admin Website and authenticating APIs.
 */
export class HealthPlatformCognitoStack extends Stack {
    public readonly UserPoolId: string;

    constructor(scope: Construct, id: string) {
        super(scope, id, {
            env: {
                region: 'us-west-2'
            },
        });

        const lambdaRole = new Role(this, 'HealthPlatformCognitoLambdaRole', {
            roleName: 'HealthPlatformCognitoLambdaRole',
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
                                // Lambda
                                'lambda:InvokeFunction',
                                // CloudWatch
                                'cloudwatch:*',
                                'logs:*',
                                //SSM
                                'ssm:*',
                            ],
                            resources: ['*']
                        })
                    ]
                }),
            },
        });

        const createPatientsDetailFunction = new lambda.Function(this, 'CreatePatientsDetailFunction', {
            functionName: "Patients-Detail-Create",
            code: new lambda.AssetCode('build/src'),
            handler: 'patients-detail-create.handler',
            runtime: lambda.Runtime.NODEJS_12_X,
            memorySize: 512,
            timeout: cdk.Duration.seconds(30),
            role: lambdaRole,
        });

        // User Pool
        const userPool = new UserPool(this, 'HealthPlatformUserPool', {
            userPoolName: 'health-platform-admin-user-pool',
            selfSignUpEnabled: true,
            userVerification: {
              emailSubject: 'Verify your email for Health Platform!',
              emailBody: 'Hello! Thanks for signing up to our Health Platform! Your verification code is {####}',
              emailStyle: VerificationEmailStyle.CODE,
            },
            signInAliases: {
                email: true,
                phone: false
            },
            autoVerify: { 
                email: true
            },
            standardAttributes: {
                // TODO: Add fullname in the future
            },
            customAttributes: {
                'joinedOn': new DateTimeAttribute(),
            },
            accountRecovery: AccountRecovery.EMAIL_ONLY,
            lambdaTriggers: {
                postConfirmation: createPatientsDetailFunction,
            }
        });
        this.UserPoolId = userPool.userPoolId;

        // User Pool Client
        const userPoolClient = new CfnUserPoolClient(this, 'HealthPlatformUserPoolClient', {
            clientName: 'HealthPlatformUserPoolClient',
            userPoolId: userPool.userPoolId,
            explicitAuthFlows: [
                "ALLOW_USER_SRP_AUTH",
                "ALLOW_REFRESH_TOKEN_AUTH"
            ]
        });

        // Identity Pool
        const identityPool = new CfnIdentityPool(this, 'HealthPlatformIdentityPool', {
            allowUnauthenticatedIdentities: false,
            cognitoIdentityProviders: [{
                clientId: userPoolClient.ref,
                providerName: userPool.userPoolProviderName
            }]
        });

        // Unauthenticated Role
        const unauthenticatedRole = new Role(
            this,
            "HealthPlatform_Website_Unauthenticated_Role",
            {
                roleName: "HealthPlatform_Website_Unauthenticated_Role",
                assumedBy: new FederatedPrincipal(
                    "cognito-identity.amazonaws.com",
                    {
                        StringEquals: {
                            "cognito-identity.amazonaws.com:aud": identityPool.ref
                        },
                        "ForAnyValue:StringLike": {
                            "cognito-identity.amazonaws.com:amr": "unauthenticated"
                        }
                    },
                    "sts:AssumeRoleWithWebIdentity"
                )
            },
        );

        // Authenticated Role
        const authenticatedRole = new Role(
            this,
            "HealthPlatform_Website_Authenticated_Role",
            {
                roleName: "HealthPlatform_Website_Authenticated_Role",
                assumedBy: new FederatedPrincipal(
                    "cognito-identity.amazonaws.com",
                    {
                        StringEquals: {
                            "cognito-identity.amazonaws.com:aud": identityPool.ref
                        },
                        "ForAnyValue:StringLike": {
                            "cognito-identity.amazonaws.com:amr": "authenticated"
                        }
                    },
                    "sts:AssumeRoleWithWebIdentity"
                )
            }
        );
        authenticatedRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSAppSyncInvokeFullAccess'))

        // Identity Pool Role Attachment
        new CfnIdentityPoolRoleAttachment(
            this,
            "HealthPlatformIdentityPoolRoleAttachment",
            {
                identityPoolId: identityPool.ref,
                roles: {
                    unauthenticated: unauthenticatedRole.roleArn,
                    authenticated: authenticatedRole.roleArn
                }
            }
        );

        // outputs
        new CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId
        });

        new CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.ref
        });

        new CfnOutput(this, 'IdentityPoolId', {
            value: identityPool.ref
        });

        new CfnOutput(this, "AuthenticatedRole", {
            value: authenticatedRole.roleArn,
        });

        new CfnOutput(this, "UnauthenticatedRole", {
            value: unauthenticatedRole.roleArn,
        });

        new ssm.StringParameter(this, 'CognitoUserPoolId', {
            description: 'Cognito User Pool Id',
            parameterName: 'CognitoUserPoolId',
            stringValue: this.UserPoolId
        }); 

        new ssm.StringParameter(this, 'CognitoUserPoolClientId', {
            description: 'User Pool Client Id',
            parameterName: 'UserPoolClientId',
            stringValue: userPoolClient.ref
        }); 

        new ssm.StringParameter(this, 'CognitoIdentityPoolId', {
            description: 'Identity Pool Id',
            parameterName: 'IdentityPoolId',
            stringValue: identityPool.ref
        }); 

        new ssm.StringParameter(this, 'CognitoUnauthenticatedRole', {
            description: 'Unauthenticated Role',
            parameterName: 'UnauthenticatedRole',
            stringValue: unauthenticatedRole.roleArn
        }); 

        new ssm.StringParameter(this, 'CognitoAuthenticatedRole', {
            description: 'Authenticated Role',
            parameterName: 'AuthenticatedRole',
            stringValue: authenticatedRole.roleArn
        }); 
    }
}

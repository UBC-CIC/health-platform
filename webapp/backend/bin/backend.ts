#!/usr/bin/env node
import { App } from '@aws-cdk/core';
import { HealthPlatformLambdaStack } from '../lib/lambda-stack';
import { HealthPlatformDynamoStack } from '../lib/dynamodb-stack';
import { HealthPlatformAppSyncStack } from '../lib/appsync-stack';
import { HealthPlatformCognitoStack } from '../lib/cognito-stack';
import { HealthPlatformIotStack } from '../lib/iot-stack';
import { HealthPlatformTimestreamStack } from '../lib/timestream-stack';

const app = new App();
new HealthPlatformDynamoStack(app, 'HealthPlatformDynamoStack');
const cognito = new HealthPlatformCognitoStack(app, 'HealthPlatformCognitoStack');
const lambdaStack = new HealthPlatformLambdaStack(app, 'HealthPlatformLambdaStack');
new HealthPlatformAppSyncStack(app, 'HealthPlatformAppSyncStack', cognito.UserPoolId, lambdaStack);
new HealthPlatformIotStack(app, 'HealthPlatformIotStack');
new HealthPlatformTimestreamStack(app, "HealthPlatformTimestreamStack");

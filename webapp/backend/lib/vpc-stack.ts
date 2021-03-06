import * as ec2 from '@aws-cdk/aws-ec2';
import cdk = require('@aws-cdk/core');
import * as iam from '@aws-cdk/aws-iam';

export class HealthPlatformVpcStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;
    public readonly lambdaSecurityGroup: ec2.SecurityGroup;
    public readonly timestreamSG: ec2.SecurityGroup;

    constructor(app: cdk.App, id: string) {
        super(app, id, {
            env: {
                region: 'us-west-2'
            },
        });
        
        this.vpc = new ec2.Vpc(this, 'HealthPlatformVpc', {
            maxAzs: 2,
            subnetConfiguration: [
              // Subnet group for Lambda functions
              {
                cidrMask: 24,
                name: "Lambda",
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED
              }
            ]
        });

        this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'HealthPlatformLambdaSG', {
            vpc: this.vpc,
            securityGroupName: "HealthPlatformLambdaSG",
        });

        // Add an interface endpoint for Timesream to allow Lambda functions inside the VPC to call Timestream without requiring a NAT Gateway
        this.vpc.addInterfaceEndpoint("TimestreamIngestEndpoint", {
            service: {
                name: `com.amazonaws.us-west-2.timestream.ingest-cell1`,
                port: 443,
                privateDnsDefault: true,
            },
            subnets: this.vpc.selectSubnets({subnetGroupName: "Lambda"}),
            securityGroups: [this.lambdaSecurityGroup]
        });
        this.vpc.addInterfaceEndpoint("TimestreamQueryEndpoint", {
            service: {
                name: `com.amazonaws.us-west-2.timestream.query-cell1`,
                port: 443,
                privateDnsDefault: true,
            },
            subnets: this.vpc.selectSubnets({subnetGroupName: "Lambda"}),
            securityGroups: [this.lambdaSecurityGroup]
        });
        const dynamoDbEndpoint = this.vpc.addGatewayEndpoint('DynamoDbEndpoint', {
            service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
        });
        dynamoDbEndpoint.addToPolicy(
            new iam.PolicyStatement({ 
              principals: [new iam.AnyPrincipal()],
              actions: ['dynamodb:GetItem', 
                        'dynamodb:DeleteItem', 
                        'dynamodb:PutItem', 
                        'dynamodb:Scan', 
                        'dynamodb:Query', 
                        'dynamodb:UpdateItem', 
                        'dynamodb:BatchWriteItem', 
                        'dynamodb:BatchGetItem', 
                        'dynamodb:DescribeTable', 
                        'dynamodb:ConditionCheckItem',
                        "dynamodb:GetShardIterator",
                        "dynamodb:DescribeStream",
                        "dynamodb:GetRecords",
                        "dynamodb:ListStreams"],
              resources: ['*'],
        }))
        this.vpc.addInterfaceEndpoint("KinesisFirehoseEndpoint", {
            service: {
                name: `com.amazonaws.us-west-2.kinesis-firehose`,
                port: 443,
                privateDnsDefault: true,
            },
            subnets: this.vpc.selectSubnets({subnetGroupName: "Lambda"}),
            securityGroups: [this.lambdaSecurityGroup]
        });
    }
}

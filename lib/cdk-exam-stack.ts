import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class CdkExamStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'CdkExamQueue', {
      visibilityTimeout: Duration.seconds(300)
    });
    
    // const vpc = new ec2.Vpc(this, 'TheVPC', {
    //   ipAddresses: ec2.IpAddresses.cidr('10.30.0.0/16'),
    // })
    
    const vpc = new ec2.Vpc(this, 'MyVPC', {
      cidr: '10.30.0.0/16',
      maxAzs: 2, 
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ]
    });
    
    const instance = new ec2.Instance(this, 'MyEC2Instance', {
      vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: ec2.MachineImage.latestAmazonLinux({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    const topic = new sns.Topic(this, 'CdkExamTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));
    
    const secret = new secretsmanager.Secret(this, 'MySecret', {
      secretName: 'metrodb-secrets',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'admin' }),
        generateStringKey: 'password',
        passwordLength: 12,
        excludePunctuation: true,
      },
    });
  }
}

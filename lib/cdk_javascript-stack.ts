import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';

//environment variables validation
// import { envValidator } from './environment';

// export interface ec2instanceprops extends cdk.StackProps {
//   InstanceSize: string;
//   CPUTypes: string;
// }
export class CdkJavascriptStack extends cdk.Stack {
  // public readonly targetGroup: elbv2.ApplicationTargetGroup;
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // const { InstanceSize, CPUTypes } = props;
    // envValidator(props);

// iam role for ec2 
    const ec2_role = new iam.Role(this, 'ec2_to_s3_full_access_cdk', {
      roleName: 'ec2_to_s3_full_access_cdk',
      description: 'Allows EC2 instances to access S3 service.',
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')
      ]
    });
// vpc flow logs
const vpcFlowLogs = new logs.LogGroup(this, 'vpcFlowLogs', {
  logGroupName: '/aws/vpc/flowlogs',
  removalPolicy: cdk.RemovalPolicy.DESTROY
});

// vpc creation

    const vpc = new ec2.Vpc(this, 'my-cdk-vpc', {
      vpcName: 'cdk-vpc',
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      natGateways: 1,
      maxAzs: 3,
      flowLogs: {
        's3': {
          destination: ec2.FlowLogDestination.toCloudWatchLogs(vpcFlowLogs),
          trafficType: ec2.FlowLogTrafficType.ALL,
        },
      },
      subnetConfiguration: [
        {
          name: 'private-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'public-subnet-1',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'isolated-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 28,
        },
      ],
     });

// seucrity group
  const ec2SecruityGroup = new ec2.SecurityGroup(this, 'ec2SecurityGroup', { 
    securityGroupName: 'ec2SecurityGroup',
    vpc,
    description: 'Allow ssh access to ec2',
    allowAllOutbound: true,
  });     
  ec2SecruityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow ssh access');
  ec2SecruityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow http access');
// s3 bucket
  const aws_s3 = new s3.Bucket(this, 'cdk_s3_bucket_851725552163', {
    bucketName: 'cdk-s3-bucket-851725552163-from-ec2',
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    encryption: s3.BucketEncryption.S3_MANAGED,
    enforceSSL: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
    serverAccessLogsPrefix: 'access_log',
    versioned: true
  });

// ALB with listners

  // const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
  //   loadBalancerName: "application-lb",
  //   vpc,
  //   internetFacing: true,
  // });
  // this.targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
  //   vpc,
  //   port: 80,
  // });
  // alb.addListener('Listener', {
  //   port: 80,
  //   defaultTargetGroups: [this.targetGroup]
  // });
  // const listener = alb.addListener('Listener', {
  //   port: 80,
  //   open: true,
  // });

// ec2 instance
  const ec2Instance = new ec2.Instance(this, 'ec2Instance', {
    vpc,
    instanceName: 'cdk_ec2_instance',
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
    machineImage: ec2.MachineImage.latestAmazonLinux2023(),
    securityGroup: ec2SecruityGroup,
    role: ec2_role,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PUBLIC,
    },
  });

// rds instance
  const rdsCluster = new rds.DatabaseCluster(this, 'AwsRdsClusterAurora', {
    defaultDatabaseName: 'awsrdsclusterdb',

    vpc,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
    },
    engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_15_4}),
    
    writer: rds.ClusterInstance.provisioned('writer', {
      publiclyAccessible: false,
    }),
    readers: [
      rds.ClusterInstance.provisioned('reader1', { promotionTier: 1 }),
      rds.ClusterInstance.serverlessV2('reader2'),
    ],
    deletionProtection: false,
  })
  
  rdsCluster.connections.allowFrom(ec2Instance, ec2.Port.tcp(5432));


  //output
  new cdk.CfnOutput(this, 'ec2-publicip', { value: ec2Instance.instancePublicIp });  
  new cdk.CfnOutput(this, 'rds-endpoint', { value: rdsCluster.clusterEndpoint.hostname });
  
  // LOAD BALANCE WITH AUTO SCALING GROUP

  const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
    vpc, 
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.SMALL),
    machineImage: ec2.MachineImage.latestAmazonLinux2023({cpuType: ec2.AmazonLinuxCpuType.X86_64}),
    securityGroup: ec2SecruityGroup,
    role: ec2_role,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
    },
  });

  // ALB
  const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
    vpc,
    internetFacing: true
  });
  // ALB listners
  const listener = lb.addListener('Listener', {
    port: 80,
    open: true,
  }); 
  listener.addTargets('Target', {
    port: 80,
    targets: [asg]
  });
  listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');
  asg.scaleOnRequestCount('AModestLoad', {
    targetRequestsPerMinute: 80,
  });

  // LAMBDA




  }
}


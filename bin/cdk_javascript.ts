#!/opt/homebrew/opt/node/bin/node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkJavascriptStack } from '../lib/cdk_javascript-stack';
import { cdkLambdaStack } from '../lib/cdk_lambda_stack';


const app = new cdk.App();

new CdkJavascriptStack(app, 'CdkJavascriptStack', { 
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: 
  { account: '851725552163', region: 'us-east-1'},
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  // ec2instanceprops: {
  //   CPUTypes: 'ARM64', // Valid options are 'X86' and 'ARM64'
  //   InstanceSize: 'LARGE' // Valid options are 'LARGE', 'XLARGE', 'XLARGE2', and 'XLARGE4'
  // }});*/'
});
new cdkLambdaStack(app, 'cdkLambdaStack', {
  env:
  { account: '851725552163', region: 'us-east-1'},
});

app.synth();
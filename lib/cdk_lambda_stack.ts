import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
export class cdkLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // lambda function
    const helloWorldlambdaFunction = new lambda.Function(this, 'HelloWorldFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'), //directory
      handler: 'hello.handler', // filename.handler
    });

    // calling lambda using API gateway
    const api = new apigateway.LambdaRestApi(this, 'HelloWorldApi', {
    //   restApiName: 'Hello World API',
    //   description: 'This is a sample API that returns a simple string.',
      handler: helloWorldlambdaFunction,
      proxy: false,
    }); 
    const helloWorldResource = api.root.addResource('hello');
    helloWorldResource.addMethod('GET');
  }
}
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2';
import * as apigatewayv2Integrations from '@aws-cdk/aws-apigatewayv2-integrations';

export class LambdaTaskStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket
    const uploadBucket = new s3.Bucket(this, 'S3UploadBucket', {
      bucketName: "testing-bhs",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

    // Lambda function
    const uploadRequestFunction = new lambda.Function(this, 'UploadRequestFunction', {
      code: lambda.Code.fromAsset('getSignedURL/'),
      functionName: 'bhstest',
      handler: 'GetUrlLambda.handler',
      runtime: lambda.Runtime.NODEJS_16_X,
      environment: {
        UploadBucket: uploadBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(3),
      memorySize: 128,
    });

    uploadBucket.grantWrite(uploadRequestFunction);

    // HTTP API
    const myApi = new apigatewayv2.HttpApi(this, 'MyApi', {
      corsPreflight: {
        allowMethods: [apigatewayv2.CorsHttpMethod.GET, apigatewayv2.CorsHttpMethod.POST, apigatewayv2.CorsHttpMethod.DELETE, apigatewayv2.CorsHttpMethod.OPTIONS],
        allowHeaders: ['*'],
        allowOrigins: ['*'],
      },
    });

    myApi.addRoutes({
      path: '/uploads',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigatewayv2Integrations.HttpLambdaIntegration('UploadAssetAPIIntegration', uploadRequestFunction),
    });

    // Outputs
    new cdk.CfnOutput(this, 'APIendpoint', {
      value: myApi.url ?? 'Unknown',
    });
    new cdk.CfnOutput(this, 'S3UploadBucketName', {
      value: uploadBucket.bucketName,
    });
 }
 }

import * as cdk from '@aws-cdk/core';
import { LambdaTaskStack } from '../lib/lambda-task-stack';

const app = new cdk.App();
new LambdaTaskStack(app, 'YourStackName');
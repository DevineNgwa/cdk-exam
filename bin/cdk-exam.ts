#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkExamStack } from '../lib/cdk-exam-stack';

const app = new cdk.App();
new CdkExamStack(app, 'CdkExamStack');

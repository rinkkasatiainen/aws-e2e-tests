# In this file, the code is added that needs to be done in each step
[back to readme.md](README.md)

## Step 2:

### lib/constructs/sns-topics.ts

### 'test-resouces'

```typescript
import * as CDK from '@aws-cdk/core';

import { env } from '../bin/env';
import { createTable } from '../lib/constructs/dynamodb';
import { createLambda } from '../lib/constructs/lambdas';
import { createSpyLambda, SpyLambdaTopics } from './constructs/spy-lambda';

export interface TestResourcesProps {
    topics: SpyLambdaTopics;
}

// tslint:disable-next-line:no-empty-interface
interface E2EStackOutput {
}

export const addTestResources: (stack: CDK.Stack, p: TestResourcesProps) => E2EStackOutput =
// @ts-ignore
    (scope, { topics }) => {
        // TODO: Step 2.2 - define spyTableName that uses your 'env' variable
        const spyTableName = `spy-table-${env}`;
        // TODO: Step 2.2 - create DynamoDB Table
        const spyTable = createTable(scope, spyTableName, { tableName: spyTableName });

        const { SNS_TOPIC_ERRORS } = topics;
        // TODO: Step 2.3 - use the Resources above to create a lambda that has proper rights!
        createLambda(scope)({ envVars: { NODE_ENV: 'dev' } })(createSpyLambda({ spyTable })({ SNS_TOPIC_ERRORS }));

        return {};
    };

```

### 'spy-lambda.ts'

```typescript

import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as IAM from '@aws-cdk/aws-iam';
import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as SNS from '@aws-cdk/aws-sns';
import path from 'path';

import { LambdaProps } from '../../lib/constructs/lambdas';
import { policyForDynamoRW, policyForSns, policyLogs } from '../../lib/constructs/policies';
import { PossibleSnsTopics } from '../../lib/constructs/sns-topics';

type LambdaCreator =
    (x: NeededTables) => (y: SpyLambdaTopics) => LambdaProps;

interface NeededTables {
    spyTable: DynamoDB.ITable;
}

export interface SpyLambdaTopics extends PossibleSnsTopics {
    SNS_TOPIC_ERRORS: SNS.ITopic;
}


// TODO: Step 2.3. Create a LambdaProps that describe a lambda that is being created to AWS
export const createSpyLambda: LambdaCreator =
    ({ spyTable }) => ({ SNS_TOPIC_ERRORS }) => {
        // TODO: Step 2.3 Add policies for 'SNS, DynamoDB and logs'
        const policies: IAM.PolicyStatement[] = [
            policyForSns([SNS_TOPIC_ERRORS.topicArn]),
            policyLogs(),
            policyForDynamoRW([spyTable.tableArn]),
        ];

        // TODO: Step 2.3. Define environment vars used by the lambda!
        const environmentVars = {
            NODE_ENV: 'dev',
            SPY_TABLE_NAME: spyTable.tableName,
        };

        // TODO: Step 2.3: Add an SnsEventSource trigger for the error topic!
        const triggers: SnsEventSource[] = [ new SnsEventSource(SNS_TOPIC_ERRORS)];

        return {
            assetFolder: path.join(__dirname, '../lambdas'),
            policies,
            environmentVars,
            triggers,
            functionName: 'SpyLambda',
            handler: 'sns-listener.handler',
        };
    };
```

### 'policies.ts'

```typescript
import * as IAM from '@aws-cdk/aws-iam';


// TODO: Step 2.3 Give Access Rights of 'sns:Publish'
export const policyForSns: (topicArns: string[]) => IAM.PolicyStatement =
    resources => {
        const policy = new IAM.PolicyStatement();
        policy.addActions( 'sns:Publish');
        policy.addResources(...resources);

        return policy;
    };

// TODO: Step 2.3 Give Access Rights of 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:GetItem'
export const policyForDynamoRW: (tableArns: string[]) => IAM.PolicyStatement =
    resources => {
        const policy = new IAM.PolicyStatement();
        policy.addActions('dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:GetItem');
        policy.addResources(...resources);

        return policy;
    };

// TODO: Step 2.3 Give Access Rights of 'logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'
export const policyLogs: () => IAM.PolicyStatement =
    () => {
        const policy = new IAM.PolicyStatement();
        policy.addActions('logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents');
        policy.addResources('arn:aws:logs:*:*:*');

        return policy;
    };
```
```typescript
import * as SNS from '@aws-cdk/aws-sns';
import * as CDK from '@aws-cdk/core';
import { env } from '../../bin/env';

export type SnsTopicNames = 'SNS_TOPIC_ERRORS';

export type PossibleSnsTopics = {
    [key in SnsTopicNames]?: SNS.ITopic;
};

// tslint:disable-next-line:no-empty-interface
export type AllSnsTopics = {
    [key in SnsTopicNames]: SNS.ITopic;
};

// TODO Step 2.1: Define topic Name here - should be one defined in AllSnsTopics

const createTopic: (stack: CDK.Stack, id: string) => SNS.ITopic =
    (stack, id) => {
        const topicName = `${id}-${env}`;

        return new SNS.Topic(stack, topicName, {
            topicName,
        });
    };

// TODO: Step 2.1. Use this to create all topics!
export const createTopics: (stack: CDK.Stack) => AllSnsTopics =
    stack => {
        return { SNS_TOPIC_ERRORS: createTopic(stack, 'errors') };
    };


```

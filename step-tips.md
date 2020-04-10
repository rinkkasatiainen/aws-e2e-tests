# In this file, the code is added that needs to be done in each step
[back to readme.md](README.md)

## Step 2:

### lib/constructs/sns-topics.ts

```typescript
import * as SNS from '@aws-cdk/aws-sns';
import * as CDK from '@aws-cdk/core';
import { env } from '../../bin/env';

export type SnsTopicNames = 'SNS_TOPIC_ERRORS';

export type AllSnsTopics = {
    [key in SnsTopicNames]: SNS.ITopic;
};

// TODO Step 2.1: Define topic Name here - should be one defined in AllSnsTopics
// tslint:disable-next-line:no-empty-interface
export interface SnsTopics extends AllSnsTopics {
    SNS_TOPIC_ERRORS: SNS.ITopic;
}

const createTopic: (stack: CDK.Stack, id: string) => SNS.ITopic =
    (stack, id) => {
        const topicName = `${id}-${env}`;

        return new SNS.Topic(stack, topicName, {
            topicName,
        });
    };

// TODO: Step 2.1. Use this to create all topics!
export const createTopics: (stack: CDK.Stack) => SnsTopics =
    stack => {
        return {
            SNS_TOPIC_ERRORS: createTopic(stack, `sns-topic-error`),
        };
    };

```

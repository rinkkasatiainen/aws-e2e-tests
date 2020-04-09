import * as CDK from '@aws-cdk/core';
import { createTopics, AllSnsTopics } from './constructs/sns-topics';

// tslint:disable-next-line:no-empty-interface
export interface CreateStackProps {
}

export interface StackTopicProps {
    region: string;
}

// tslint:disable-next-line:no-empty-interface
interface E2EStackOutput {
}

export const createStackTopics: (stack: CDK.Stack, p: StackTopicProps) => AllSnsTopics =
    stack => {
        // TODO: Step 2.1 - create an SNS Topic

        return createTopics(stack);
    };

export const createStack: (stack: CDK.Stack, p: CreateStackProps) => E2EStackOutput =
// @ts-ignore
    (scope, {}) => {
        // TODO: Step 2.1 - create an SNS Topic
        // createTopics(scope);
        // TODO: Step 2.2 - create DynamoDB Table
        // createTables(scope);

        // TODO: Step 2.3 - use the Resources above to create a lambda that has proper rights!
        // createLambda(scope)({ envVars: { NODE_ENV: 'dev' } })(createSpyLambda({ spyTable })({ SNS_TOPIC_ERRORS }));

        return {};
    };

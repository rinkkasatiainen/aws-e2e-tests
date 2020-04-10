import * as CDK from '@aws-cdk/core';

import { createTables, AllTables } from './constructs/dynamodb';
import { createTopics, AllSnsTopics } from './constructs/sns-topics';

// tslint:disable-next-line:no-empty-interface
export interface CreateStackProps {
    topics: AllSnsTopics;
}

export interface StackTopicProps {
    region: string;
}

// tslint:disable-next-line:no-empty-interface
interface E2EStackOutput {
    tables: AllTables;
}

export const createStackTopics: (stack: CDK.Stack, p: StackTopicProps) => AllSnsTopics =
    stack => {
        // TODO: Step 2.1 - create an SNS Topic

        return createTopics(stack);
    };

export const createStack: (stack: CDK.Stack, p: CreateStackProps) => E2EStackOutput =
// @ts-ignore
    (scope, { topics: { SNS_TOPIC_ERRORS } }) => {
        const tables = createTables(scope);

        // TODO: Step 3.1 - Add fails miserably lambda
        // const { resourcesTable } = tables;
        // createLambda
        // (scope)
        // ({ envVars: { NODE_ENV: 'dev' } })
        // (failsMiserablyLambda({ resourcesTable })({ SNS_TOPIC_ERRORS }));

        return { tables };
    };

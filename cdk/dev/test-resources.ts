import * as CDK from '@aws-cdk/core';
import { PossibleSnsTopics } from '../lib/constructs/sns-topics';

// tslint:disable-next-line:no-empty-interface
export interface TestResourcesProps {
    topics: PossibleSnsTopics;
}

// tslint:disable-next-line:no-empty-interface
interface E2EStackOutput {
}

export const addTestResources: (stack: CDK.Stack, p: TestResourcesProps) => E2EStackOutput =
// @ts-ignore
    (scope, {}) => {
        // TODO: Step 2.2 - define spyTableName that uses your 'env' variable
        // const spyTableName = `XXYYZZ-${env}`
        // TODO: Step 2.2 - create DynamoDB Table
        // createTable(scope, spyTableName, { tableName: spyTableName });

        // TODO: Step 2.3 - use the Resources above to create a lambda that has proper rights!
        // createLambda(scope)({ envVars: { NODE_ENV: 'dev' } })(createSpyLambda({ spyTable })({ SNS_TOPIC_ERRORS }));

        return {};
    };

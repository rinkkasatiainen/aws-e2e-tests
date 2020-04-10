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
        const spyTableName = `spy-table-${ env }`;
        const spyTable = createTable(scope, spyTableName, { tableName: spyTableName });

        const { SNS_TOPIC_ERRORS } = topics;
        createLambda(scope)({ envVars: { NODE_ENV: 'dev' } })(createSpyLambda({ spyTable })({ SNS_TOPIC_ERRORS }));

        // TODO: Step 3.1: Add CloudFormation Output to pass SpyTable name for E2E test
        // addCfnOutput(scope)('SpyTableName')({
        //     value: spyTableName,
        //     exportName: `${ scope.stackName }:Table:SpyTableName`,
        // });


        return {};
    };

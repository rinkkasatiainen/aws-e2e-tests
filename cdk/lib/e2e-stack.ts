import * as CDK from '@aws-cdk/core';

import {createTables, AllTables} from './constructs/dynamodb';
import {AllSnsTopics} from './constructs/sns-topics';
import {createLambda} from "./constructs/lambdas";
import {failsMiserablyLambda} from "./constructs/lambdas/fails-miserably";
import {errorLogger} from "./constructs/lambdas/error-logger";

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

export const createStack: (stack: CDK.Stack, p: CreateStackProps) => E2EStackOutput =
    (scope, {topics: {SNS_TOPIC_ERRORS}}) => {
        const tables = createTables(scope);

        // TODO: Step 3.1 - Add fails miserably lambda
        const {resourcesTable, errorsTable} = tables;
        let lambdaprod1 = createLambda
        (scope)
        ({envVars: {NODE_ENV: 'dev'}})
        (failsMiserablyLambda({resourcesTable})({SNS_TOPIC_ERRORS}));

        let lambdaprod2 = createLambda
        (scope)
        ({envVars: {NODE_ENV: 'dev'}})
        (errorLogger({errorsTable})({SNS_TOPIC_ERRORS}));

        new CDK.CfnOutput(scope, `lambda-failsmiserably`, {
            value: lambdaprod1.functionName,
            exportName: `${scope.stackName}:Lambda:prod1`,
        });
        new CDK.CfnOutput(scope, `lambda-error-logger`, {
            value: lambdaprod2.functionName,
            exportName: `${scope.stackName}:Lambda:prod2`,
        });


        return {tables};
    };

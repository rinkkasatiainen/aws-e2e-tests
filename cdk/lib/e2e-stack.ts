import * as CDK from '@aws-cdk/core';

import {AllTables} from './constructs/dynamodb';
import {AllSnsTopics} from './constructs/sns-topics';
import {createLambda} from "./constructs/lambdas";
import {failsMiserablyLambda} from "./constructs/lambdas/fails-miserably";
import {errorLogger} from "./constructs/lambdas/error-logger";
import {addCfnOutput} from "./constructs/cfn-output";

export interface CreateStackProps {
    topics: AllSnsTopics;
    tables: AllTables;
}

export interface StackTopicProps {
    region: string;
}

// tslint:disable-next-line:no-empty-interface
interface E2EStackOutput {
}

export const createStack: (stack: CDK.Stack, p: CreateStackProps) => E2EStackOutput =
    (scope, {topics: {SNS_TOPIC_ERRORS}, tables}) => {
        // TODO: Step 3.1 - Add fails miserably lambda
        // const {resourcesTable } = tables;
        // createLambda
        // (scope)
        // ({envVars: {NODE_ENV: 'dev'}})
        // (failsMiserablyLambda({resourcesTable})({SNS_TOPIC_ERRORS}));


        // TODO: STEP 3.3:
        // addCfnOutput(scope)('lambdaThatFails')({
        //     value: lambdaprod1.functionName,
        //     exportName: `${scope.stackName}:Lambda:prod1`,
        // });
        // TODO: Step 3.3: This is added for tests to warm up lambdas before the test run
        // new CDK.CfnOutput(scope, `lambda-error-logger`, {
        //     value: lambdaprod2.functionName,
        //     exportName: `${scope.stackName}:Lambda:prod2`,
        // });
    };

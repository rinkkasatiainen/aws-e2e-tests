import * as CDK from '@aws-cdk/core';

import {createTables, AllTables} from './constructs/dynamodb';
import {AllSnsTopics} from './constructs/sns-topics';
import {createLambda, EnvVars} from "./constructs/lambdas";
import {failsMiserablyLambda} from "./constructs/lambdas/fails-miserably";
import {errorLogger} from "./constructs/lambdas/error-logger";
import {calls3rdPartyApi} from "./constructs/lambdas/calls-3rd-party-api";

export interface CreateStackProps {
    topics: AllSnsTopics;
    envVars: EnvVars;
}

export interface StackTopicProps {
    region: string;
}

// tslint:disable-next-line:no-empty-interface
interface E2EStackOutput {
    tables: AllTables;
}

export const createStack: (stack: CDK.Stack, p: CreateStackProps) => E2EStackOutput =
    (scope, {topics: {SNS_TOPIC_ERRORS, SNS_TOPIC_SUCCESS, SNS_START}, envVars}) => {
        const tables = createTables(scope);

        // TODO: Step 3.1 - Add fails miserably lambda
        const {resourcesTable, errorsTable} = tables;
        let lambdaprod1 = createLambda(scope)
        ({envVars})
        (failsMiserablyLambda({resourcesTable})({SNS_TOPIC_ERRORS}));

        let lambdaprod2 = createLambda(scope)
        ({envVars})
        (errorLogger({errorsTable})({SNS_TOPIC_ERRORS}));

        let lambdaprod3 = createLambda(scope)
        ({envVars})
        (calls3rdPartyApi(envVars)({resourcesTable})({SNS_TOPIC_ERRORS, SNS_TOPIC_SUCCESS, SNS_START}));

        new CDK.CfnOutput(scope, `lambda-failsmiserably`, {
            value: lambdaprod1.functionName,
            exportName: `${scope.stackName}:Lambda:prod1`,
        });
        new CDK.CfnOutput(scope, `lambda-error-logger`, {
            value: lambdaprod2.functionName,
            exportName: `${scope.stackName}:Lambda:prod2`,
        });
        new CDK.CfnOutput(scope, `lambda-3rd-party`, {
            value: lambdaprod3.functionName,
            exportName: `${scope.stackName}:Lambda:prod3`,
        });


        return {tables};
    };

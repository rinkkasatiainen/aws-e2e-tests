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

export const createStack: (stack: CDK.Stack, p: CreateStackProps) => void =
    (scope, {topics: {SNS_TOPIC_ERRORS}, tables}) => {
        const {resourcesTable, errorsTable} = tables;

        const lambdaprod1 = createLambda
        (scope)
        ({envVars: {NODE_ENV: 'dev'}})
        (failsMiserablyLambda({resourcesTable})({SNS_TOPIC_ERRORS}));

        createLambda
        (scope)
        ({envVars: {NODE_ENV: 'dev'}})
        (errorLogger({errorsTable})({SNS_TOPIC_ERRORS}));

        addCfnOutput(scope)('lambdaThatFails')({
            value: lambdaprod1.functionName,
            exportName: `${scope.stackName}:Lambda:prod1`,
        });

        return {}
    };

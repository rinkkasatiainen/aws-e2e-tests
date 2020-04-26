import * as CDK from '@aws-cdk/core';

import {env} from '../bin/env';
import {AllTables, createTable} from '../lib/constructs/dynamodb';
import {createLambda} from '../lib/constructs/lambdas';
import {createSpyLambda, SpyLambdaTopics} from './constructs/spy-lambda';
import {addCfnOutput} from "../lib/constructs/cfn-output";
import {createEmptyDevTablesLambda} from "./constructs/empty-dev-tables-lambda";

export interface TestResourcesProps {
    topics: SpyLambdaTopics;
    tables: AllTables;
}

// tslint:disable-next-line:no-empty-interface
interface E2EStackOutput {
}

export const addTestResources: (stack: CDK.Stack, p: TestResourcesProps) => E2EStackOutput =
// @ts-ignore
    (scope, {topics, tables}) => {

        const spyTableName = `spy-table-${env}`;
        const spyTable = createTable(scope, spyTableName, {tableName: spyTableName});
        addCfnOutput(scope)('SpyTableName')({
            value: spyTableName,
            exportName: `${scope.stackName}:Table:SpyTableName`,
        });

        const {SNS_TOPIC_ERRORS} = topics;
        createLambda(scope)({envVars: {NODE_ENV: 'dev'}})(
            createSpyLambda({spyTable})({SNS_TOPIC_ERRORS})
        );


        createLambda(scope)({envVars: {NODE_ENV: 'dev'}})(
            createEmptyDevTablesLambda({...tables, spyTable})
        )


        return {};
    };

import * as CDK from '@aws-cdk/core';
import * as DynamoDB from '@aws-cdk/aws-dynamodb';

import {env} from '../bin/env';
import {AllTables, createTable} from '../lib/constructs/dynamodb';
import {createLambda, EnvVars} from '../lib/constructs/lambdas';
import {createSpyLambda, SpyLambdaTopics} from './constructs/spy-lambda';
import {addCfnOutput} from "../lib/constructs/cfn-output";
import {createEmptyDevTablesLambda} from "./constructs/empty-dev-tables-lambda";

export interface TestResourcesProps {
    topics: SpyLambdaTopics;
    tables: AllTables;
    spyTable: DynamoDB.ITable;
}

// tslint:disable-next-line:no-empty-interface
interface E2EStackOutput {
}

export const createSpyTable = (scope: CDK.Stack) => {
    const spyTableName = `spy-table-${env}`;
    const spyTable = createTable(scope, spyTableName, {tableName: spyTableName});
    addCfnOutput(scope)('SpyTableName')({
        value: spyTableName,
        exportName: `${scope.stackName}:Table:SpyTableName`,
    });
    return spyTable;
};

export const addTestResources: (envVars: EnvVars) => (stack: CDK.Stack, p: TestResourcesProps) => E2EStackOutput =
    envVars => (scope, {topics, tables, spyTable}) => {
        const {SNS_TOPIC_ERRORS} = topics;
        createLambda(scope)({envVars})(
            createSpyLambda({spyTable})({SNS_TOPIC_ERRORS})
        );

        createLambda(scope)({envVars})(
            createEmptyDevTablesLambda({...tables, spyTable})
        )

        return {};
    };

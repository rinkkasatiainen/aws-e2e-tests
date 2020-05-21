import * as CDK from '@aws-cdk/core';
import * as DynamoDB from '@aws-cdk/aws-dynamodb';

import {createSpyLambda, SpyLambdaTopics} from './constructs/spy-lambda';
import {env} from "../bin/env";
import {CreateTableProps} from "../lib/constructs/dynamodb";
import {createLambda} from "../lib/constructs/lambdas";

export interface TestResourcesProps {
    topics: SpyLambdaTopics;
}

// tslint:disable-next-line:no-empty-interface
interface E2EStackOutput {
}

export const addTestResources: (stack: CDK.Stack, p: TestResourcesProps) => E2EStackOutput =
// @ts-ignore
    (scope, {topics}) => {
        const {SNS_TOPIC_ERRORS} = topics;
        const spyTable = getDynamoDBTable(scope, `XXYYZZ`)
        // TODO: Step 2.3 - use the Resources above to create a lambda that has proper rights!
        createLambda(scope)({envVars: {NODE_ENV: 'dev'}})(createSpyLambda({spyTable})({SNS_TOPIC_ERRORS}));

        return {};
    };


const getDynamoDBTable: (scope: CDK.Stack, tableBaseName: string) => DynamoDB.ITable =
    (scope, tableBaseName) => {
        const tableName = `${tableBaseName}-${env}`;
        return DynamoDB.Table.fromTableArn(scope, tableName, `arn:aws:dynamodb:${scope.region}:${scope.account}:table/${tableName}`);
    };

// TODO: Step 2.2 Use this helper to create the table
export const createTable: (scope: CDK.Stack, id: string, props: CreateTableProps) => DynamoDB.ITable =
    (scope, id, props) =>
        new DynamoDB.Table(scope, id, {
            partitionKey: {name: 'pk', type: DynamoDB.AttributeType.STRING},
            sortKey: {name: 'sk', type: DynamoDB.AttributeType.STRING},
            tableName: props.tableName,
        });


export const createTestTables: (stack: CDK.Stack) => E2EStackOutput =
    (scope) => {
        // TODO: Step 2.2 - define spyTableName that uses your 'env' variable
        const spyTableName = `XXYYZZ-${env}`
        // TODO: Step 2.2 - create DynamoDB Table
        createTable(scope, spyTableName, {tableName: spyTableName});

        return {};
    };

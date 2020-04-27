import * as CDK from '@aws-cdk/core';
import * as DynamoDB from '@aws-cdk/aws-dynamodb';

import {createSpyLambda, SpyLambdaTopics} from './constructs/spy-lambda';
import {env} from "../bin/env";
import {AllTables} from "../lib/constructs/dynamodb";
import {createLambda} from "../lib/constructs/lambdas";
import {addCfnOutput} from "../lib/constructs/cfn-output";

export interface TestResourcesProps {
    topics: SpyLambdaTopics;
    tables: AllTables;
    spyTable: DynamoDB.ITable;
}

// tslint:disable-next-line:no-empty-interface
interface E2EStackOutput {
}

export const addTestResources: (stack: CDK.Stack, p: TestResourcesProps) => E2EStackOutput =
    (scope, {topics}) => {
        const {SNS_TOPIC_ERRORS} = topics;
        const spyTable = getDynamoDBTable(scope, `spy-table`)
        createLambda(scope)({envVars: {NODE_ENV: 'dev'}})(createSpyLambda({spyTable})({SNS_TOPIC_ERRORS}));

        return {};
    };


const getDynamoDBTable: (scope: CDK.Stack, tableBaseName: string) => DynamoDB.ITable =
    (scope, tableBaseName) => {
        const tableName = `${tableBaseName}-${env}`;
        return DynamoDB.Table.fromTableArn(scope, tableName, `arn:aws:dynamodb:${scope.region}:${scope.account}:table/${tableName}`);
    };

export const createTable: (scope: CDK.Stack, id: string, props: { tableName: string }) => DynamoDB.ITable =
    (scope, id, props) =>
        new DynamoDB.Table(scope, id, {
            partitionKey: {name: 'pk', type: DynamoDB.AttributeType.STRING},
            sortKey: {name: 'sk', type: DynamoDB.AttributeType.STRING},
            tableName: props.tableName,
        });


export const createTestTables: (stack: CDK.Stack) => E2EStackOutput =
    (scope) => {
        const spyTableName = `spy-table-${env}`
        createTable(scope, spyTableName, {tableName: spyTableName});

        addCfnOutput(scope)('SpyTableName')({
            value: spyTableName,
            exportName: `${ scope.stackName }:Table:SpyTableName`,
        });

        return {};
    };

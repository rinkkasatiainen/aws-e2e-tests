import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as CDK from '@aws-cdk/core';
import { env } from '../../bin/env';

interface CreateTableProps {
    tableName: string;
}

export interface PossibleTables {
    'resourcesTable'?: DynamoDB.ITable
    'errorsTable'?: DynamoDB.ITable
};

export type PossibleTables = {
    [key in TableNames]?: DynamoDB.ITable;
};

// tslint:disable-next-line:no-empty-interface
export type AllTables = {
    [key in TableNames]: DynamoDB.ITable;
};


// TODO: Step 2.2 Use this helper to create the table
export const createTable: (scope: CDK.Stack, id: string, props: CreateTableProps) => DynamoDB.ITable =
    (scope, id, props) =>
        new DynamoDB.Table(scope, id, {
            partitionKey: { name: 'pk', type: DynamoDB.AttributeType.STRING },
            sortKey: { name: 'sk', type: DynamoDB.AttributeType.STRING },
            tableName: props.tableName,
        });

// TODO: Step 3.1 Use this helper to create the new table - define key where it's used
const createTableWith:
    (scope: CDK.Stack, id: TableNames, propProvider: (tableName: string) => DynamoDB.TableProps) =>
        DynamoDB.ITable =
    (scope, id, props) =>
        new DynamoDB.Table(scope, id, props(`${ id }-${ env }`));


// TODO: Step 3.1. Use this to create all tables!
export const createTables: (stack: CDK.Stack) => AllTables =
    stack => {
        return {
            resourcesTable: createTableWith(stack, 'resourcesTable', tableName => ({
                partitionKey: { name: 'domain', type: DynamoDB.AttributeType.STRING },
                tableName,
            })),
        };
    };

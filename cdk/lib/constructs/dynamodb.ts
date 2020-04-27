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

export type TableNames = keyof PossibleTables;

export type AllTables = {
    [key in TableNames]: DynamoDB.ITable;
};

export const createTable: (scope: CDK.Stack, id: string, props: CreateTableProps) => DynamoDB.ITable =
    (scope, id, props) =>
        new DynamoDB.Table(scope, id, {
            partitionKey: { name: 'pk', type: DynamoDB.AttributeType.STRING },
            sortKey: { name: 'sk', type: DynamoDB.AttributeType.STRING },
            tableName: props.tableName,
        });

const createTableWith:
    (scope: CDK.Stack, id: TableNames, propProvider: (tableName: string) => DynamoDB.TableProps) =>
        DynamoDB.ITable =
    (scope, id, props) =>
        new DynamoDB.Table(scope, id, props(`${ id }-${ env }`));

export const createTables: (stack: CDK.Stack) => AllTables =
    stack => {
        return {
            resourcesTable: createTableWith(stack, 'resourcesTable', tableName => ({
                partitionKey: { name: 'domain', type: DynamoDB.AttributeType.STRING },
                tableName,
            })),
            errorsTable: createTableWith(stack, 'errorsTable', tableName => ({
                partitionKey: {name: 'domain', type: DynamoDB.AttributeType.STRING},
                sortKey: {name: 'createdAt', type: DynamoDB.AttributeType.NUMBER},
                tableName,
            }))
        };
    };

import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as CDK from '@aws-cdk/core';
import { env } from '../../bin/env';

export interface PossibleTables {
    'resourcesTable'?: DynamoDB.ITable
    'errorsTable'?: DynamoDB.ITable
};

export type TableNames = keyof PossibleTables;

export type AllTables = {
    [key in TableNames]: DynamoDB.ITable
};

// TODO: Step 3.1 Use this helper to create the new table - define key where it's used
// const createTableWith:
//     (scope: CDK.Stack, id: TableNames, propProvider: (tableName: string) => DynamoDB.TableProps) =>
//         DynamoDB.ITable =
//     (scope, id, props) =>
//         new DynamoDB.Table(scope, id, props(`${ id }-${ env }`));
//

// TODO: Step 3.1. Use this to create all tables!
export const createTables: (stack: CDK.Stack) => AllTables =
    stack => {
        return {
            // resourcesTable: createTableWith(stack, 'resourcesTable', tableName => ({
            //     partitionKey: { name: 'domain', type: DynamoDB.AttributeType.STRING },
            //     tableName,
            // })),
        };
    };

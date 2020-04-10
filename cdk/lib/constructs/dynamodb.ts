import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as CDK from '@aws-cdk/core';

// tslint:disable-next-line:no-empty-interface
export interface StackTables {
    // spyTable: DynamoDB.ITable;
}

interface CreateTableProps {
    tableName: string;
}

// TODO: Step 2.2 Use this helper to create the table
export const createTable: (scope: CDK.Stack, id: string, props: CreateTableProps) => DynamoDB.ITable =
    (scope, id, props) =>
        new DynamoDB.Table(scope, id, {
            partitionKey: { name: 'pk', type: DynamoDB.AttributeType.STRING },
            sortKey: { name: 'sk', type: DynamoDB.AttributeType.STRING },
            tableName: props.tableName,
        });

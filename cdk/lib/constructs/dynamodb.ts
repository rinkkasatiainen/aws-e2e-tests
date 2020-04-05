import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as CDK from '@aws-cdk/core';


export interface StackTables {
    spyTable: DynamoDB.ITable;
}

// interface CreateTableProps {
//     tableName: string;
// }

// TODO: Step 2.2 Use this helper to create the table
// const createTable: (scope: CDK.Stack, id: string, props: CreateTableProps) => DynamoDB.ITable =
//     (scope, id, props) =>
//         new DynamoDB.Table(scope, id, {
//             partitionKey: { name: 'pk', type: AttributeType.STRING },
//             sortKey: { name: 'sk', type: AttributeType.STRING },
//             tableName: props.tableName,
//         });

// TODO: Step 2.2 - use this to create table
export const createTables: (scope: CDK.Stack) => StackTables =
    () => {
        // tslint:disable-next-line:no-object-literal-type-assertion
        const spyTable = {} as DynamoDB.ITable;

        return { spyTable };
    };

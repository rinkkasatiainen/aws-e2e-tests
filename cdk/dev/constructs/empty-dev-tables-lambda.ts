import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as IAM from '@aws-cdk/aws-iam';
import {SnsEventSource} from '@aws-cdk/aws-lambda-event-sources';
import path from 'path';
import {LambdaProps} from '../../lib/constructs/lambdas';

import {
    policyForDynamoDelete,
    policyForDynamoScan,
    policyLogs
} from '../../lib/constructs/policies';
import {PossibleTables} from "../../lib/constructs/dynamodb";

type LambdaCreator =
    (x: NeededTables) => LambdaProps;

interface NeededTables extends PossibleTables {
    spyTable: DynamoDB.ITable;
    errorsTable: DynamoDB.ITable;
    resourcesTable: DynamoDB.ITable
}


export const createEmptyDevTablesLambda: LambdaCreator =
    ({spyTable, errorsTable, resourcesTable}) => {
        const policies: IAM.PolicyStatement[] = [
            policyLogs(),
            policyForDynamoScan([spyTable.tableArn, errorsTable.tableArn, resourcesTable.tableArn]),
            policyForDynamoDelete([spyTable.tableArn, errorsTable.tableArn, resourcesTable.tableArn]),
        ];

        const environmentVars = {};

        const triggers: SnsEventSource[] = [];

        return {
            assetFolder: path.join(__dirname, '../lambdas'),
            policies,
            environmentVars,
            triggers,
            functionName: 'EmptyDevTables',
            handler: 'empty-dev-tables.handler',
        };
    };

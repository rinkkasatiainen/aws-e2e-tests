import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as IAM from '@aws-cdk/aws-iam';
import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as SNS from '@aws-cdk/aws-sns';
import path from 'path';
import { PossibleTables } from '../dynamodb';
import { LambdaProps } from '../lambdas';
import { policyForDynamoRW, policyForSns, policyLogs } from '../policies';
import { PossibleSnsTopics } from '../sns-topics';

type LambdaCreator =
    (x: NeededTables) => (y: Topics) => LambdaProps;

interface NeededTables extends PossibleTables {
    resourcesTable: DynamoDB.ITable;
}

export interface Topics extends PossibleSnsTopics {
    SNS_TOPIC_ERRORS: SNS.ITopic;
}

export const failsMiserablyLambda: LambdaCreator =
    ({ resourcesTable }) => ({ SNS_TOPIC_ERRORS }) => {

        const policies: IAM.PolicyStatement[] = [
            policyForSns([SNS_TOPIC_ERRORS.topicArn]),
            policyLogs(),
            policyForDynamoRW([resourcesTable.tableArn]),
        ];

        const environmentVars = {
            NODE_ENV: 'dev',
            RESOURCE_TABLE_NAME: resourcesTable.tableName,
            ERRORS_SNS_ARN: SNS_TOPIC_ERRORS.topicArn
        };

        const triggers: SnsEventSource[] = [];

        return {
            assetFolder: path.join(__dirname, '../../../../dist'),
            policies,
            environmentVars,
            triggers,
            functionName: 'FailsMiserably',
            handler: 'fails-miserably.handler',
        };
    };

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
    errorsTable: DynamoDB.ITable;
}

export interface Topics extends PossibleSnsTopics {
    SNS_TOPIC_ERRORS: SNS.ITopic;
}

export const errorLogger: LambdaCreator =
    ({ errorsTable }) => ({ SNS_TOPIC_ERRORS }) => {

        const policies: IAM.PolicyStatement[] = [
            policyForSns([SNS_TOPIC_ERRORS.topicArn]),
            policyLogs(),
            policyForDynamoRW([errorsTable.tableArn]),
        ];

        // Step 3.1: Add envVars that the labda uses / see dist/fails-miserably.ts
        const environmentVars = {
            NODE_ENV: 'dev',
            ERRORS_TABLE: errorsTable.tableName,
            ERRORS_SNS_ARN: SNS_TOPIC_ERRORS.topicArn,
        };

        // Step 3.1: no event sources
        const triggers: SnsEventSource[] = [ new SnsEventSource(SNS_TOPIC_ERRORS)];

        return {
            assetFolder: path.join(__dirname, '../../../../published'),
            policies,
            environmentVars,
            triggers,
            functionName: 'ErrorLoggar',
            handler: 'sync-errors.sync',
        };
    };

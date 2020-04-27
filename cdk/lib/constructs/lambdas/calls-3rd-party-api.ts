import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as IAM from '@aws-cdk/aws-iam';
import {SnsEventSource} from '@aws-cdk/aws-lambda-event-sources';
import * as SNS from '@aws-cdk/aws-sns';
import path from 'path';
import {PossibleTables} from '../dynamodb';
import {EnvVars, LambdaProps} from '../lambdas';
import {policyForDynamoRW, policyForSns, policyLogs} from '../policies';
import {PossibleSnsTopics} from '../sns-topics';

type LambdaCreator = (envVars: EnvVars) =>
    (x: NeededTables) => (y: Topics) => LambdaProps;

interface NeededTables extends PossibleTables {
    resourcesTable: DynamoDB.ITable;
}

export interface Topics extends PossibleSnsTopics {
    SNS_TOPIC_ERRORS: SNS.ITopic;
    SNS_TOPIC_SUCCESS: SNS.ITopic;
}

export const calls3rdPartyApi: LambdaCreator =
    envVars => ({resourcesTable}) => ({SNS_TOPIC_ERRORS, SNS_TOPIC_SUCCESS}) => {

        const policies: IAM.PolicyStatement[] = [
            policyLogs(),
            policyForSns([SNS_TOPIC_ERRORS.topicArn, SNS_TOPIC_SUCCESS.topicArn]),
            policyForDynamoRW([resourcesTable.tableArn]),
        ];

        // Step 3.1: Add envVars that the labda uses / see dist/fails-miserably.ts
        const environmentVars = {
            ...envVars,
            ERRORS_TABLE: resourcesTable.tableName,
            ERRORS_SNS_ARN: SNS_TOPIC_ERRORS.topicArn,
            SUCCESS_SNS_ARN: SNS_TOPIC_ERRORS.topicArn,
        };

        // Step 3.1: no event sources
        const triggers: SnsEventSource[] = [new SnsEventSource(SNS_TOPIC_ERRORS)];

        return {
            assetFolder: path.join(__dirname, '../../../../dist'),
            policies,
            environmentVars,
            triggers,
            functionName: 'Calls3rdParty',
            handler: 'calls-3rd-party-api.sync',
        };
    };

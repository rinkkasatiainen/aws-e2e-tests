import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as IAM from '@aws-cdk/aws-iam';
import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as SNS from '@aws-cdk/aws-sns';
import path from 'path';

import { LambdaProps } from '../../lib/constructs/lambdas';
import { policyForDynamoRW, policyForSns, policyLogs } from '../../lib/constructs/policies';
import { PossibleSnsTopics } from '../../lib/constructs/sns-topics';

type LambdaCreator =
    (x: NeededTables) => (y: SpyLambdaTopics) => LambdaProps;

interface NeededTables {
    spyTable: DynamoDB.ITable;
}

export interface SpyLambdaTopics extends PossibleSnsTopics {
    SNS_TOPIC_ERRORS: SNS.ITopic;
}

export const createSpyLambda: LambdaCreator =
    ({ spyTable }) => ({ SNS_TOPIC_ERRORS }) => {
        const policies: IAM.PolicyStatement[] = [
            policyForSns([SNS_TOPIC_ERRORS.topicArn]),
            policyLogs(),
            policyForDynamoRW([spyTable.tableArn]),
        ];

        const environmentVars = {
            NODE_ENV: 'dev',
            SPY_TABLE_NAME: spyTable.tableName,
        };

        const triggers: SnsEventSource[] = [ new SnsEventSource(SNS_TOPIC_ERRORS)];

        return {
            assetFolder: path.join(__dirname, '../lambdas'),
            policies,
            environmentVars,
            triggers,
            functionName: 'SpyLambda',
            handler: 'sns-listener.handler',
        };
    };

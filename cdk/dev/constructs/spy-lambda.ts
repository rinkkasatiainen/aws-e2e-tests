import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as IAM from '@aws-cdk/aws-iam';
import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as SNS from '@aws-cdk/aws-sns';
import path from 'path';

import {LambdaProps} from '../../lib/constructs/lambdas';
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


// TODO: Step 2.3. Create a LambdaProps that describe a lambda that is being created to AWS
export const createSpyLambda: LambdaCreator =
    ({ spyTable }) => ({ SNS_TOPIC_ERRORS }) => {
        // TODO: Step 2.3 Add policies for 'SNS, DynamoDB and logs'
        const policies: IAM.PolicyStatement[] = [
            policyForSns([SNS_TOPIC_ERRORS.topicArn]),
            policyLogs(),
            policyForDynamoRW([spyTable.tableArn]),
        ];

        // TODO: Step 2.3. Define environment vars used by the lambda!
        const environmentVars = {
            SPY_TABLE_NAME: spyTable.tableName,
        };

        // TODO: Step 2.3: Add an SnsEventSource trigger for the error topic!
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

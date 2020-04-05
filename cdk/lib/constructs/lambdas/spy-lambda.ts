import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as IAM from '@aws-cdk/aws-iam';
import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as SNS from '@aws-cdk/aws-sns';

import { LambdaProps } from '../lambdas';
import { AllSnsTopics } from '../sns-topics';

type LambdaCreator =
    (x: NeededTables) => (y: NeededTopics) => LambdaProps;

interface NeededTables {
    spyTable: DynamoDB.ITable;
}

interface NeededTopics extends AllSnsTopics {
    SNS_TOPIC_ERRORS: SNS.ITopic;
}


// TODO: Step 2.3. Create a LambdaProps that describe a lambda that is being created to AWS
export const createSpyLambda: LambdaCreator =
// @ts-ignore
    ({ spyTable }) => ({ SNS_TOPIC_ERRORS }) => {
        // TODO: Step 2.3 Add policies for 'SNS, DynamoDB and logs'
        const policies: IAM.PolicyStatement[] = [];

        // TODO: Step 2.3. Define environment vars used by the lambda!
        const environmentVars = {
            NODE_ENV: 'dev',
        };

        // TODO: Step 2.3: Add an SnsEventSource trigger for the error topic!
        const triggers: SnsEventSource[] = [];

        return {
            policies,
            environmentVars,
            triggers,
            functionName: 'SpyLambda',
            handler: 'sns-listener.handler',
        };
    };

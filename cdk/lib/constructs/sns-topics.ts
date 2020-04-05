import * as SNS from '@aws-cdk/aws-sns';
import * as CDK from '@aws-cdk/core';

export type SnsTopicNames = 'SNS_TOPIC_ERRORS';

export type AllSnsTopics = {
    [key in SnsTopicNames]: SNS.ITopic;
};

// TODO Step 2.1: Define topic Name here - should be one defined in AllSnsTopics
// tslint:disable-next-line:no-empty-interface
export interface SnsTopics extends AllSnsTopics {
}

// TODO: Step 2.1. Use this to create all topics!
export const createTopics: (x: CDK.Stack) => SnsTopics =
    () => {
        return {};
    };

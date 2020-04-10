import * as SNS from '@aws-cdk/aws-sns';
import * as CDK from '@aws-cdk/core';

export type SnsTopicNames = 'SNS_TOPIC_ERRORS';

export type PossibleSnsTopics = {
    [key in SnsTopicNames]?: SNS.ITopic;
};

// tslint:disable-next-line:no-empty-interface
export type AllSnsTopics = {
    // [key in SnsTopicNames]: SNS.ITopic;
};

// TODO Step 2.1: Define topic Name here - should be one defined in AllSnsTopics

// const createTopic: (stack: CDK.Stack, id: string) => SNS.ITopic =
//     (stack, id) => {
//         const topicName = `${id}-${env}`;
//
//         return new SNS.Topic(stack, topicName, {
//             topicName,
//         });
//     };

// TODO: Step 2.1. Use this to create all topics!
export const createTopics: (stack: CDK.Stack) => AllSnsTopics =
    () => {
        return {
        };
    };

import * as SNS from '@aws-cdk/aws-sns';
import * as CDK from '@aws-cdk/core';
import {env} from "../../bin/env";

export type PossibleSnsTopics = {
    SNS_TOPIC_ERRORS?: SNS.ITopic;
    SNS_TOPIC_SUCCESS?: SNS.ITopic;
};

export type SnsTopicNames = keyof PossibleSnsTopics;

export type AllSnsTopics = {
    [key in SnsTopicNames]: SNS.ITopic;
};

const createTopic: (stack: CDK.Stack, id: string) => SNS.ITopic =
    (stack, id) => {
        const topicName = `${id}-${env}`;

        return new SNS.Topic(stack, topicName, {
            topicName,
        });
    };

export const createTopics: (stack: CDK.Stack) => AllSnsTopics =
    stack => {
        return {
            SNS_TOPIC_ERRORS: createTopic(stack, "errors")
        };
    };

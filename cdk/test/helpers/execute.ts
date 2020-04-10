import { Lambda, SNS } from 'aws-sdk';

type InvokeLambdaFunction = (props: { FunctionName: string, payloadAsJson?: any }) => Promise<any>;

interface TestExecute {
    invokeLambda: InvokeLambdaFunction;

    publishSns: (param: { message: { domain: string; merchant_id: number } }) => {
        to: (topicName: string) => Promise<any>
    };
}

export const testExecute: (props: { region: string }) => TestExecute =
    ({ region }) => {
        return {
            invokeLambda: async ({ FunctionName, payloadAsJson }) => {
                const params: Lambda.Types.InvocationRequest = { FunctionName };
                if (payloadAsJson) {
                    params.Payload = JSON.stringify(payloadAsJson);
                }

                return new Lambda({ region })
                    .invoke(params)
                    .promise();
            },

            publishSns: ({ message }) => ({
                to: async topicArn => new SNS({ region, apiVersion: '2010-03-31' }).publish({
                    Message: JSON.stringify(message),
                    TopicArn: topicArn,
                }).promise(),
            }),
        };
    };

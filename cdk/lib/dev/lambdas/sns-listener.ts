import { Handler, SNSEvent } from 'aws-lambda';
import { AWSError, DynamoDB } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

interface Message {
    domain: string;
}

export const handler: Handler<SNSEvent, {statusCode: number, body: string}> =
    async (event, context) => {
        const region = context.invokedFunctionArn.split(':')[3];
        const documentClient = new DynamoDB.DocumentClient({ region });
        const promises: Array<Promise<PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>>> = [];

        console.log('In Handler!', event);

        event.Records
            .filter(it => it.EventSource === 'aws:sns')
            .forEach(({ Sns }) => {

                const topic = Sns.TopicArn.split(':').slice(-1).pop();

                const message: Message = JSON.parse(Sns.Message);

                const addSpyEvent: DynamoDB.DocumentClient.PutItemInput = {
                    TableName: process.env.SPY_TABLE_NAME || 'a-random-table-that-probably-does-not-exist',
                    Item: {
                        pk: message.domain,
                        sk: topic,
                        data: message,
                    },
                };

                promises.push(documentClient.put(addSpyEvent).promise());
            });

        await Promise.all(promises);

        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: 'hello world' }),
        };

        return response;
    };

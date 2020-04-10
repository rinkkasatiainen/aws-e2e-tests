import { Handler, SNSEvent } from 'aws-lambda';
import { DynamoDB, SNS } from 'aws-sdk';

interface Message {
    domain: string;
    data: { error: string; bar: string; };
}

export const handler: Handler<SNSEvent, { statusCode: number, body: string }> =
    async (event, context) => {
        console.log('Lambda that fails miserably', event);

        const region = context.invokedFunctionArn.split(':')[3];
        const documentClient = new DynamoDB.DocumentClient({ region });

        const input: DynamoDB.DocumentClient.GetItemInput = {
            TableName: process.env.RESOURCE_TABLE || 'a-random-table-that-probably-does-not-exist',
            Key: {
                pk: 'foo.bar.com',
            },
        };
        const { Item } = await documentClient.get(input).promise();

        const domain = Item ? Item.domain : 'unknown domain';
        const message: Message = { domain, data: { error: 'foo', bar: 'baz' } };

        const errorTopicArn = process.env.ERRORS_SNS;
        await new SNS({ region })
            .publish({ Message: JSON.stringify(message), TopicArn: errorTopicArn })
            .promise();

        const response = {
            statusCode: 503,
            body: JSON.stringify({ message: 'Fails, as expected' }),
        };

        return response;
    };

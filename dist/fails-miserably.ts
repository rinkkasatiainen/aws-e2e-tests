import { Handler } from 'aws-lambda';
import { DynamoDB, SNS } from 'aws-sdk';

interface Message {
    domain: string;
    data: { error: string; bar: string; };
}

export const handler: Handler<{ domain: string }, { statusCode: number, body: string }> =
    async (event, context) => {
        console.log('Lambda that fails miserably', event, context);

        const region = context.invokedFunctionArn.split(':')[3];
        const documentClient = new DynamoDB.DocumentClient({ region });
        const { domain } = event;

        if (domain) {
            const input: DynamoDB.DocumentClient.GetItemInput = {
                TableName: process.env.RESOURCE_TABLE_NAME || 'a-random-table-that-probably-does-not-exist',
                Key: {
                    domain,
                },
            };
            const { Item } = await documentClient.get(input).promise();

            const message: Message = { domain, data: Item?.data || 'Unknown data' };

            const errorTopicArn = process.env.ERRORS_SNS_ARN;
            await new SNS({ region })
                .publish({ Message: JSON.stringify(message), TopicArn: errorTopicArn })
                .promise();
        }

        const response = {
            statusCode: 503,
            body: JSON.stringify({ message: 'Fails, as expected' }),
        };

        return response;
    };


import { AWSError, DynamoDB } from 'aws-sdk';

import { PromiseResult } from 'aws-sdk/lib/request';
import { StackConfig } from '../test-aws-config';

export interface TestSetup {
    addResource: (x: { domain: string, data: any }) => {
        save: () => Promise<PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>>
    };
}


export const testSetup: (x: DynamoDB.DocumentClient, y: StackConfig) => TestSetup =
    (documentClient, stackConfig) => ({
        addResource: ( { domain, data } ) => ({
            save: async () => {
                const putItemInput: DynamoDB.DocumentClient.PutItemInput = {
                    TableName: stackConfig.ResourcesTable,
                    Item: {
                        domain, data,
                    },
                    ReturnValues: 'NONE',
                };

                return documentClient.put(putItemInput).promise();
            },
        }),
    });

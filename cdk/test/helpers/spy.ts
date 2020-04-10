import {AWSError, DynamoDB} from 'aws-sdk';
import {PromiseResult} from 'aws-sdk/lib/request';
import {sleep} from './sleep';

import {StackConfig} from '../test-aws-config';

type SnsTopicSpy = (topicName: string) => {
    for: (domain: string) => Promise<PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWSError>>;
};

type ErrorsTableSpy = () => {
    for: (domain: string) => Promise<PromiseResult<DynamoDB.DocumentClient.QueryOutput, AWSError>>;
};

const TIMESTAMP_IN_THE_PAST = 1579252880412;
const WAIT_BETWEEN_DB_QUERIES = 500;

export interface TestSpy {
    snsTopic: SnsTopicSpy;
    errorsTable: ErrorsTableSpy;
    waitFor: (key: DynamoDB.DocumentClient.Key) =>
        Promise<PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWSError>>;
}

const getDbEntry:
    (x: string, key: DynamoDB.DocumentClient.Key) => AWS.DynamoDB.DocumentClient.GetItemInput =
    (tableName, keyToGet) => ({
        TableName: tableName,
        Key: keyToGet,
    });

const expectToFindData:
    (x: DynamoDB.DocumentClient) => (times: number) =>
        (key: AWS.DynamoDB.DocumentClient.Key, tablename: string) => Promise<any> =
    documentClient => times => async (key, tableName) => {
        while (times > 0) {

            console.log(`-  trying to find ${JSON.stringify(key)} for ${times} times`);
            const result = await documentClient.get(getDbEntry(tableName, key)).promise();

            if (result && result.Item) {
                return result;
            }

            await sleep(WAIT_BETWEEN_DB_QUERIES);
            times--;
        }

        console.error(`Expected to find ${JSON.stringify({tableName, key})}, but did not find it.`);

        return null;
    };

const expectToFindBatchData:
    (x: DynamoDB.DocumentClient) => (times: number) =>
        (x: { pkName: string, pk: string }, tablename: string) => Promise<any> =
    documentClient => times => async ({pkName, pk}, tableName) => {
        while (times > 0) {

            console.log(`-  trying to find ${pk} for ${times} times`);
            const queryInput: DynamoDB.DocumentClient.QueryInput = {
                TableName: tableName,
                ProjectionExpression: '#pk, #sk, #data',
                KeyConditionExpression: '#pk = :pk and #sk > :timestamp',
                ExpressionAttributeNames: {
                    '#pk': pkName,
                    '#sk': 'createdAt',
                    '#data': 'data',
                },
                ExpressionAttributeValues: {
                    ':pk': pk,
                    ':timestamp': TIMESTAMP_IN_THE_PAST,
                },
            };
            const result = await documentClient.query(queryInput).promise();

            if (result && result.Items && result.Items.length > 0) {
                return result;
            }

            await sleep(WAIT_BETWEEN_DB_QUERIES);
            times--;
        }

        console.error(`Expected to find ${JSON.stringify({tableName, pk: pk})}, but did not find it.`);

        return null;
    };

export const testSpy: (props: { documentClient: DynamoDB.DocumentClient, stackConfig: StackConfig }) => TestSpy =
    ({documentClient, stackConfig}) => ({
        snsTopic: topicName => ({
            for: async domain => {
                return expectToFindData(documentClient)(5)({pk: domain, sk: topicName}, stackConfig.SpyTableName);
            },
        }),
        errorsTable: () => ({
            for: async domain => {
                return expectToFindBatchData(documentClient)(5)({
                    pkName: 'domain',
                    pk: domain
                }, stackConfig.ErrorsTable);
            },
        }),
        waitFor: (key: AWS.DynamoDB.DocumentClient.Key) => {
            return expectToFindData(documentClient)(5)(key, 'get-random-test-data-table-name');
        },
    })
;

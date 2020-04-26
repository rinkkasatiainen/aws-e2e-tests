import {Handler} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';
// import {env} from "../../bin/env";

// This is needed here, as we're not still using webpack to make a build of files to be used.
const env = 'dev';

interface TableToEmpty {
    TableName: string;
    pk: string;
    sk?: string;
}

const deleteItem:
    (a: DynamoDB.DocumentClient) => (b: TableToEmpty) => (x?: DynamoDB.DocumentClient.ItemList) => Promise<void> =
    documentClient => table => async items => {
        if (!items) {
            return;
        }
        for (const item of items) {
            const key = {
                [table.pk]: item[table.pk],
            };
            if (table.sk) {
                key[table.sk] = item[table.sk];
            }
            const deleteItemEntry: DynamoDB.DocumentClient.DeleteItemInput = {
                TableName: table.TableName,
                Key: key,
                ReturnValues: 'NONE',
            };

            const result = await documentClient.delete(deleteItemEntry).promise();

            console.log('Result after delete: ', result);
        }
    };

export const handler: Handler<any, { statusCode: number, body: string }> =
    async (event, context) => {
        console.log('Executing empty dev tables', event, context);

        if (process.env.NODE_ENV !== 'dev') {
            console.log('not on dev environment, exiting');
            return {
                statusCode: 403, body: JSON.stringify({message: 'only in DEV'})
            }
        }

        const {invokedFunctionArn} = context;
        const region = invokedFunctionArn.split(':')[3];
        const documentClient = new DynamoDB.DocumentClient({region});

        const tablesToEmpty = [
            {
                TableName: `spy-table-${env}`,
                pk: 'pk',
                sk: 'sk',
            },
            {
                TableName: `errorsTable-${env}`,
                pk: 'domain',
                sk: 'createdAt',
            },
            {
                TableName: `resourcesTable-${env}`,
                pk: 'domain',
            },
        ];

        for (const table of tablesToEmpty) {
            const scanParams: DynamoDB.DocumentClient.ScanInput = {
                TableName: table.TableName,
            };

            const data = await documentClient.scan(scanParams).promise();

            console.log(`Getting data for ${table.TableName}`, data);
            await deleteItem(documentClient)(table)(data.Items);

        }
        const response = {
            statusCode: 200,
            body: JSON.stringify({message: 'deleted'}),
        };

        return response;
    }
;


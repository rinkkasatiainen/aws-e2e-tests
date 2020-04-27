import {Context, Handler, SNSEvent} from 'aws-lambda';
import {AWSError, DynamoDB} from 'aws-sdk';
import {PromiseResult} from 'aws-sdk/lib/request';
import {DomainError, ErrorType} from "../common/result";
import moment from "moment";

// todo: Use MOMENT LATER
const now: () => number = moment.now

export const isValidErrorFromSNS: (x: SNSEvent | any) => boolean =
    snsEvent => snsEvent.Records && snsEvent.Records.length > 0 && !!snsEvent.Records[0].Sns;


const baseData: (domain: string) => { domain: string, createdAt: number } =
    domain => ({domain, createdAt: now()});

const tableName = process.env.ERRORS_TABLE || 'a-random-table-that-probably-does-not-exist-dev';

const toDbEntry: <T>(error: DomainError<ErrorType, T>) => DynamoDB.DocumentClient.PutItemInput =
    error => ({
        TableName: tableName,
        Item: {
            ...error,
            ...baseData(error.domain),
        },
    });

export const handleSnsEvent:
    (documentClientProvider: () => DynamoDB.DocumentClient) => (x: SNSEvent) => Promise<PromiseResult<any, AWSError>> =
    documentClientProvider => snsEvent => {
        const promises: Array<Promise<any>> = [];
        const documentClient = documentClientProvider();
        snsEvent.Records.forEach(record => {
            // console.log(`ERROR: ${record.Sns.Subject} for domain: ${JSON.parse(record.Sns.Message).domain}`, record.Sns.Message);
            const message = JSON.parse(record.Sns.Message);
            const error: DomainError<ErrorType, any> = message.error;

            let params = toDbEntry(message);
            console.error("Failed: ", JSON.stringify(error), JSON.stringify(message), JSON.stringify(params));
            const promise = documentClient.put(params).promise();

            promises.push(promise);
        });

        return Promise.all(promises);
    };

export const sync: Handler = (event: SNSEvent, context: Context) => {
    const region = context.invokedFunctionArn.split(':')[3];
    let logEvent = handleSnsEvent(() => new DynamoDB.DocumentClient({region}));
    if (isValidErrorFromSNS(event)) {
        logEvent(event);
    } else {
        console.warn('WARNING: Logger did not receive an SNSEvent!');
    }
};

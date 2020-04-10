import { expect } from 'chai';
import * as u from 'uuid';

import { mocha } from 'approvals';
import { DynamoDB } from 'aws-sdk';
import { warmUpLambdas } from '../helpers/cold-start';
import { testExecute } from '../helpers/execute';
import { testSpy, TestSpy } from '../helpers/spy';
import { fetchStackConfiguration, DocumentClient, StackConfig } from '../test-aws-config';

mocha();
// tslint:disable:no-unused-expression
// tslint:disable:variable-name
// tslint:disable:no-invalid-this

export const createProductSyncError: (x: any) => any =
    error => ({ error: { ...error, type: 'ProductError' } });

const randomUUID = u.v4;

// const random100 = () => Math.floor(Math.random() * 100);

const TOPIC_TO_TRIGGER_LAMBDA = `snsErrorTopic`;

// const TIMESTAMP_IN_THE_PAST = 1579252880412;
describe('Error Logger', () => {
    let domain: string;
    let spy: TestSpy;

    let stackConfig: StackConfig;
    const documentClient: DynamoDB.DocumentClient = DocumentClient();
    const execute = testExecute({ region: 'eu-central-1' });
    let reason: string;
    let message: string;

    before(async function () {
        this.timeout(20000);
        stackConfig = await fetchStackConfiguration({ StackName: 'test-stack' });
        await warmUpLambdas(stackConfig, ['']);

        return new Promise(resolve => resolve());
    });
    describe('When Error happens', () => {

        beforeEach(() => {
            spy = testSpy({ documentClient, stackConfig });
            // setup = testSetup(documentClient)({ domain, merchant_id: merchantId, stackConfig });
            domain = `${(randomUUID())}.not.real.only.for.tests.com`;
            reason = 'internal';
            message = 'new error message';
        });


        it('Should log errors to Error DB', async () => {
            const error = createProductSyncError({
                domain, reason, message, type: 'ProductError',
            });

            // TODO: GET SNS Topic from stackConfig!
            const topicArnParts: any = stackConfig[TOPIC_TO_TRIGGER_LAMBDA].split(':');

            const topicArn = topicArnParts.join(':');
            await execute.publishSns({ message: error }).to(topicArn);

            const res = await spy.errorsTable().for(domain);

            expect(res).to.not.be.null;

            return new Promise(resolve => resolve());
        }).timeout(10000);

    });


});

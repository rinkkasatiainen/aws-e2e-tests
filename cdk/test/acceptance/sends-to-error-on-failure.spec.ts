import AWS from 'aws-sdk';

import {expect} from 'chai';
import * as u from 'uuid';

// import { mocha } from 'approvals';
import {env} from '../../bin/env';
import {warmUpLambdas} from '../helpers/cold-start';
import {testExecute} from '../helpers/execute';
import {testSetup, TestSetup} from '../helpers/setup';
import {testSpy, TestSpy} from '../helpers/spy';
import {fetchStackConfiguration, region, StackConfig} from '../test-aws-config';

// mocha();
// tslint:disable:no-unused-expression
// tslint:disable:variable-name
// tslint:disable:no-invalid-this

export const createProductSyncError: (x: any) => any =
    error => ({error: {...error, type: 'ProductError'}});

const randomUUID = u.v4;

// const random100 = () => Math.floor(Math.random() * 100);

const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

// const TIMESTAMP_IN_THE_PAST = 1579252880412;
describe('Scaffold - first E2E test', () => {
    let domain: string;
    let spy: TestSpy;
    let setup: TestSetup;

    let stackConfig: StackConfig;
    const documentClient = new AWS.DynamoDB.DocumentClient({region});
    const execute = testExecute({region});

    before(async function () {
        this.timeout(20000);
        stackConfig = await fetchStackConfiguration([{StackName: `TestStack${capitalize(env)}`}, {StackName: `Resources${capitalize(env)}`}]);
        await warmUpLambdas(stackConfig, ['']);

        return new Promise(resolve => resolve());
    });
    describe('When Error happens', () => {

        beforeEach(() => {
            spy = testSpy({documentClient, stackConfig});
            setup = testSetup(documentClient, stackConfig);
            domain = `${(randomUUID())}.not.real.only.for.tests.com`;
        });


        it('should take data from dynamoDB and push that to error Topic', async () => {
            // Arrange
            // put data to DynamoDB!!
            await setup.addResource({domain, data: {error: domain}}).save();
            console.log("added test data")

            // Act --> Invoke the function
            const lambdaName = stackConfig.lambdaThatFails;
            await execute.invokeLambda({FunctionName: lambdaName, payloadAsJson: {domain}});
            console.log("invoked function")


            // Assert. -> Wait for some time for a lambda to push events to SNS & spy to push to DynamoDb
            const res = await spy.snsTopic(`errors-${env}`).for(domain);
            expect(res.Item?.data).to.eql({domain, data: {error: domain}});

            return new Promise(resolve => resolve());
        }).timeout(10000);

        it('errorLogger should be triggered by the failure, and that logs to dynamodb', async () => {

            // Arrange --> put data to DynamoDB!!
            await setup.addResource({domain, data: {error: domain}}).save();
            console.log("added test data")

            // Act --> Invoke the function
            const lambdaName = stackConfig.lambdaThatFails
            await execute.invokeLambda({FunctionName: lambdaName, payloadAsJson: {domain}});
            console.log("invoked function")


            // Assert --> Wait for some time for a lambda to push events to SNS & spy to push to DynamoDb
            const res = await spy.errorsTable().for(domain);
            const items = res.Items || []
            expect(items.length).to.eql(1);

            const {data: d, domain: dom} = items[0]
            expect({data: d, domain: dom}).to.eql({data: {error: domain}, domain})

            return new Promise(resolve => resolve());
        }).timeout(10000)

    });


});

// This is the way all CDK packages are imported.
import * as CDK from '@aws-cdk/core';
import {addTestResources, createSpyTable} from '../dev/test-resources';
import {createTopics} from '../lib/constructs/sns-topics';
import {createStack} from '../lib/e2e-stack';
import {env} from './env';
import {addCfnOutput} from "../lib/constructs/cfn-output";
import {EnvVars} from "../lib/constructs/lambdas";
import {createFakeApi} from "../dev/constructs/fake-api";

const app = new CDK.App();

interface E2EStackProps {
    tags: { [key: string]: string };
}


class E2EStack extends CDK.Stack {

    public constructor(parent: CDK.App, id: string, props: E2EStackProps) {
        super(parent, id, {
            tags: props.tags,
        });
    }
}

const stack = new E2EStack(app, `test-stack-${env}`, {
    tags: {aTag: 'aValue'},
});
const spyTable = createSpyTable(stack);
const fakeApi = createFakeApi(stack, {lambdas: [{filename: 'success'}]})(spyTable)

const topics = createTopics(stack);
const envVars: EnvVars = {
    NODE_ENV: 'dev',
    API_CALL_URL: fakeApi.url
};

const {tables} = createStack(stack, {topics, envVars});
addTestResources(envVars)(stack, {topics, tables, spyTable});

const {resourcesTable, errorsTable} = tables;
addCfnOutput(stack)('ErrorsTable')({
    value: errorsTable.tableName,
    exportName: `${stack.stackName}:Table:ErrorsTable`,
})

addCfnOutput(stack)('ResourcesTable')({
    value: resourcesTable.tableName,
    exportName: `${stack.stackName}:Table:ResourcesTable`,
});

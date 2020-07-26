// This is the way all CDK packages are imported.
import * as CDK from '@aws-cdk/core';
import {addTestResources, createTestTables} from '../dev/test-resources';
import {createTopics} from '../lib/constructs/sns-topics';
import {createStack} from '../lib/e2e-stack';
import {env} from './env';
import {createTables} from "../lib/constructs/dynamodb";
import {addCfnOutput} from "../lib/constructs/cfn-output";
import {createFakeApi} from "../dev/constructs/fake-api";
import {EnvVars} from "../lib/constructs/lambdas";
// import {addCfnOutput} from "../lib/constructs/cfn-output";

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

class PermanentResources extends CDK.Stack {
    public constructor(parent: CDK.App, id: string) {
        super(parent, id, {
            tags: {aTag: 'avalue'},
        });
    }
}

const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const stack = new E2EStack(app, `TestStack${capitalize(env)}`, {
    tags: {aTag: 'aValue'},
});
const permanentResources = new PermanentResources(app, `Resources${capitalize(env)}`);
const tables = createTables(permanentResources);

// This is something really test dependant - fake api requires spyTable to be used,

const { spyTable } = createTestTables(permanentResources);
const fakeApi = createFakeApi(stack, {lambdas: [{filename: 'success'}]})(spyTable)
const envVars: EnvVars = {
    NODE_ENV: 'dev',
    API_CALL_URL: fakeApi.url
};

const topics = createTopics(stack);
createStack(stack, {topics, tables, envVars});

// Add Test resources

addTestResources(stack, {topics, tables, spyTable, envVars});

const {resourcesTable, errorsTable} = tables;
addCfnOutput(permanentResources)('notExisting')({
    value: errorsTable.tableName,
    exportName: `${stack.stackName}:Table:ErrorsTable`,
})
addCfnOutput(permanentResources)('ErrorsTable')({
    value: errorsTable.tableName,
    exportName: `${stack.stackName}:Table:ErrorsTable`,
})
//
addCfnOutput(permanentResources)('ResourcesTable')({
    value: resourcesTable.tableName,
    exportName: `${stack.stackName}:Table:ResourcesTable`,
});

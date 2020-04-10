// This is the way all CDK packages are imported.
import * as CDK from '@aws-cdk/core';
import {addTestResources, createTestTables} from '../dev/test-resources';
import { createTopics } from '../lib/constructs/sns-topics';
import { createStack } from '../lib/e2e-stack';
import { env } from './env';

const app = new CDK.App();

interface E2EStackProps {
    tags: {[key: string]: string};
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
    tags: { aTag: 'aValue' },
});
const permamentResources = new PermanentResources(app, `Resources${capitalize(env)}`);

createTestTables(permamentResources)

const topics = createTopics(stack);

// TODO: Step 3.1 - add fails-miserably code to the stack.
/* const { tables } = */ createStack(stack, { topics });

const { resourcesTable, errorsTable } = tables;
addCfnOutput(stack)('ErrorsTable')({
    value: errorsTable.tableName,
    exportName: `${stack.stackName}:Table:ErrorsTable`,
})

addTestResources(stack, { topics, tables });


const { resourcesTable, errorsTable } = tables;
addCfnOutput(stack)('ErrorsTable')({
    value: errorsTable.tableName,
    exportName: `${stack.stackName}:Table:ErrorsTable`,
})

addCfnOutput(stack)('ResourcesTable')({
    value: resourcesTable.tableName,
    exportName: `${stack.stackName}:Table:ResourcesTable`,
});

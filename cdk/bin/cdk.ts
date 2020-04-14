// This is the way all CDK packages are imported.
import * as CDK from '@aws-cdk/core';
import { addTestResources } from '../dev/test-resources';
import { createTopics } from '../lib/constructs/sns-topics';
import { env } from './env';

// Create new CDK App
const app = new CDK.App();

// Here is defined Stack Props that will be defined for Stack!
interface E2EStackProps {
    tags: {[key: string]: string};
}


class E2EStack extends CDK.Stack {

    // CDK uses `Construct`s that more often than not take three arguments when creating one:
    // 1) the parent scope (which is a CDK Construct
    // 2) unique ID, which has to be unique in the AWS Account, and sometimes globally in AWS (S3).
    // 3) a set of props that can be defined (see above)
    public constructor(parent: CDK.App, id: string, props: E2EStackProps) {
        super(parent, id, {
            tags: props.tags,
        });
    }
}

// tslint:disable-next-line:no-unused-expression
const stack = new E2EStack(app, `test-stack-${env}`, {
    tags: { aTag: 'aValue' },
});

const topics = createTopics(stack);
// Add test related resources here. Everything we need to set up tools to see what's happening inside.
addTestResources(stack, { topics });

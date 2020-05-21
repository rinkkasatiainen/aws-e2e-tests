# aws-e2e-tests

This repository is step by step guide in creating a serverless environment using AWS CDK, while creating end2end tests and unit tests. 

If you need help / copy-paste code, check file [step-tips.md](step-tips.md)

To follow the progress, check out [TODO list](todo.md)

Check the [Testing Strategy](test-strategy.md) to understand the end goals

Previous steps:
   * [step-0](./step-0.md)

## BEFORE:
To start with this step, do the following:

   * `git checkout step-1`  
   * `npm install`  # to install dependenencies
   * create file `cdk/bin/env.ts` with content
```typescript
export const env = `<your username, or something>`
```

This env file is added to `.gitignore`, and wont be overwritten when changing branches between steps. It is used to 
store all AWS environment specific details. 

# Step Goals:

When running this workshop earlier, we found out that errors in CDK stack in later steps required us to destroy the stack,
but the whole stack is not destroyed, as some of the created resources are more permantent than others (S3 and DynamoDB). 
For that reason, I choose to try out an experiment where we create 2 separate stacks, one for permanent things that evolves
independently of the application Stack.

## Step 1: create CDK app with multiple stacks:

### create stacks

To start, add a file 'cdk.json' with content:
```json
{
  "app": "node cdk/bin/cdk.js"
}
```

Then create a file 'cdk/bin/cdk.ts' with following content

```
import * as CDK from '@aws-cdk/core';
import {env} from './env';

const app = new CDK.App();

class E2EStack extends CDK.Stack {
    public constructor(parent: CDK.App, id: string) {
        super(parent, id, {
            tags: {aTag: 'avalue'},
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

new E2EStack(app, `TestStack${capitalize(env)}`);
new PermanentResources(app, `Resources${capitalize(env)}`);
```

### compile typescript to Javascript for deployment

The typescript CDK stack needs to be compiled to JS. For that, execute command ```npm run tsc``` that does exactly that.

### deploy

To list the Stacks you can deploy to AWS, you can run the following command: `$ npm run cdk -- synth`, which prints out
```
[...]
Successfully synthesized to [...]/aws-e2e-tests/cdk.out
Supply a stack id (ResourcesDev, TestStackDev) to display its template.
```

To deploy stack to AWS, run `npm run cdk -- deploy [ResourcesDev | TestStackDev]`

The end result should be as follows:
```
> cdk "deploy" "ResourcesDev"

(node:62552) ExperimentalWarning: The fs.promises API is experimental
ResourcesDev: deploying...
ResourcesDev: creating CloudFormation changeset...
 0/2 | 9:54:38 AM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata | CDKMetadata 
 0/2 | 9:54:39 AM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata | CDKMetadata Resource creation Initiated
 1/2 | 9:54:39 AM | CREATE_COMPLETE      | AWS::CDK::Metadata | CDKMetadata 
 2/2 | 9:54:41 AM | CREATE_COMPLETE      | AWS::CloudFormation::Stack | ResourcesDev 

    ResourcesDev

Stack ARN:
arn:aws:cloudformation:<region>:<AWS_ID>:stack/ResourcesDev/<UUID>
```


## TEST

This step is done when the stack is created successfully. This might require you to have certain AWS access rights.
You can verify this from AWS Console -> Service CloudFormation -> Stacks

## Steps before step-2

To start with next step, do the following:
```bash
    git reset --hard HEAD # to remove the cdk/bin/cdk.ts file.
    git checkout step-2 # to install dependencies
    npm install # to install dependenencies
    run npm run tsc:watch to start watching changes on CDK stack files.
```

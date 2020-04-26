## Step 1: create CDK stack:

### create first stack

To start, add a file 'cdk.json' with content:
```json
{
  "app": "node cdk/bin/cdk.js"
}
```

Then create a file 'cdk/bin/cdk.ts' with following content

Previous steps:
   * [step-0](./step-0.md)
```
const app = new CDK.App();

class E2EStack extends CDK.Stack {

  public constructor(parent: CDK.App, id: string){
    super(parent, id, {
      tags: {aTag: "avalue"}
    });
  }
}

const stack = new E2EStack(app, "test-stack")
```

### compile typescript to Javascript for deployment

The typescript CDK stack needs to be compiled to JS. For that, execute command ```npm run tsc``` that does exactly that.

### deploy

To deploy stack to AWS, run `cdk deploy --profile e2e`

The end result should be as follows:
```
cdk deploy --profile e2e                                                                                                                                                  test-stack: deploying...
test-stack: creating CloudFormation changeset...
 0/2 | 3:06:51 PM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata | CDKMetadata 
 0/2 | 3:06:52 PM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata | CDKMetadata Resource creation Initiated
 1/2 | 3:06:52 PM | CREATE_COMPLETE      | AWS::CDK::Metadata | CDKMetadata 
 2/2 | 3:06:54 PM | CREATE_COMPLETE      | AWS::CloudFormation::Stack | test-stack 

 ✅  test-stack
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


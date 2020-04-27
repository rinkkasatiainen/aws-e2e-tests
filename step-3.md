# aws-e2e-tests
This repository is step by step guide in creating a serverless environment using AWS CDK, while creating end2end tests and unit tests. 

If you need help / copy-paste code, check file [step-tips.md](step-tips.md)

To follow the progress, check out [TODO list](todo.md)

Check the [Testing Strategy](test-strategy.md) to understand the end goals

Previous steps:
   * [step-0](./step-0.md)
   * [step-1](./step-1.md)
   * [step-2](./step-2.md)

## Introduction to step goals

Learning goals are
   * introduce CloudFormation Outputs (set the topic name)
   * trigger a lambda function that will fail (and publish message to SNS)
   * verify that error is stored to spy DB


## BEFORE : get ready for this step:
To start with this step, do the following:

   * `git reset --hard HEAD` 
   * `git checkout step-3`  
   * `npm install`  # to install dependencies
   * `npm run tsc:watch` to start watching changes on CDK stack files.
   
## Step 3: Deploy first 'production lambda' and test that

### Step 3.1:  Create first production lambda

We use create a folder 'dist' and to add lambdas there. Later, the dist folder will be automatically created when bundling 
lambdas using Webpack.

There is lambda `dist/fails-miserably.ts`. Let's add that to the stack -> go to e2e-stack.ts  and create lambda. 
This lambda requires a DynamoDB table from which it gets data, and SNS_TOPIC_ERROR to publish errors to.   

to test this, you can test this by invoking the function from console:
``` 
$ aws lambda invoke --function-name <add lambda ARN here> tmp.out
{
    "StatusCode": 200,
    "ExecutedVersion": "$LATEST"
}  
$
```


### Step 3.2 - Create test

Run the test with `npm run test:e2e` and see it fail. It fails because the test does not know the Table Name. 
It's not in the StackConfig.

To fix that, we need to add tableNames to CloudFormation Outputs  in file `test-resources.ts` and also ResourcesTable in cdk.ts

# aws-e2e-tests
This repository is step by step guide in creating a serverless environment using AWS CDK, while creating end2end tests and unit tests. 

If you need help / copy-paste code, check file [step-tips.md](step-tips.md)

To follow the progress, check out [TODO list](todo.md)

Check the [Testing Strategy](test-strategy.md) to understand the end goals

Previous steps:
   * [step-0](./step-0.md)
   * [step-1](./step-1.md)
   * [step-2](./step-2.md)
   * [step-3](./step-3.md)

## Introduction to step goals

Learning goals are
   * Fake a HTTP call to a 3rd party service (that we don't want to use in tests.)
   * inject fake-data to lambda either by
        * environment variable
        * in dynamoDB entry
        * as parameter from SNS Event
   * create a test case where 
        1) call function by publishing to 'start' SNS topic
        2) should succeed -> publish to 'success' SNS topic. Spy this!
   * create a test case where
        1) api call fails. / this need updating fakes, and deploying to prod. 

## BEFORE : get ready for this step:
To start with this step, do the following:

   * `git reset --hard HEAD` 
   * `git checkout step-4`  
   * `npm install`  # to install dependencies
   
## Step 4: Changes from step-3

   * dist folder no longer exists -> production code is in `src` folder where a lambda 
   [calls 3rd party api](./src/lambdas/calls-3rd-party-api.ts) uses 3rd party libraries to make a HTTP call. This 
   causes a couple of issues
        * we need to add the sources of the 3rd party api (`axios`) to the bundle that's uploaded to Lambda
        * to do that, we bundle the script using `webpack`
   * the steps to build and deploy are to execute `npn run build`, which
        1) that uses `tsc` to transpile Typescript code from `src` to `dist/src` folder
        2) next step is to execute `webpack` to bundle code from `dist/src` to `dist/publish` which does the bundling magic.
            * later, tree shaking happens at this stage
        3) executes `tsc` on the CDK app (which uses different [tsconfig.json](cdk/tsconfig.json)). 
        That makes cdk app ready to folder `dist/cdk`
   * once this is done, app can be deployed using `npm run cdk:deploy`

### Step 4.1:  Create first production lambda

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


### Step 4.2 - Create test

Run the test with `npm run test:e2e` and see it fail. It fails because the test does not know the Table Name. 
It's not in the StackConfig.

To fix that, we need to add tableNames to CloudFormation Outputs  in file `test-resources.ts` and also ResourcesTable in cdk.ts

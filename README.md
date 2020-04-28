# aws-e2e-tests
This repository is step by step guide in creating a serverless environment using AWS CDK, while creating end2end tests and unit tests. 

If you need help / copy-paste code, check file [step-tips.md](step-tips.md)

To follow the progress, check out [TODO list](todo.md)

This env file is added to `.gitignore`, and wont be overwritten when changing branches between steps. It is used to 
store all AWS environment specific details. 

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

## Step 2: create first Lambda, DynamoDB table, SNS Topic

add region to your env.ts file
```typescript 
 // ..
 export const region = 'eu-central-1'
```

### Step 2.1 Create an SNS Topic

open cdk.ts and add SNS topic creation there.. 

Tip: Look for the code for comments on // step 2.1


This succeeds, if ```cdk diff ``` returns
```
$ cdk diff 
Stack test-stack
Resources
[+] AWS::SNS::Topic SNS_TOPIC_ERRORS-dev SNSTOPICERRORSdevCFB7A9D7 
```

Then deploy:

```
$ cdk deploy
test-stack: deploying...
test-stack: creating CloudFormation changeset...
 0/3 | 4:18:48 PM | CREATE_IN_PROGRESS   | AWS::SNS::Topic    | SNS_TOPIC_ERRORS-dev (SNSTOPICERRORSdevCFB7A9D7) 
 0/3 | 4:18:48 PM | UPDATE_IN_PROGRESS   | AWS::CDK::Metadata | CDKMetadata 
 0/3 | 4:18:48 PM | CREATE_IN_PROGRESS   | AWS::SNS::Topic    | SNS_TOPIC_ERRORS-dev (SNSTOPICERRORSdevCFB7A9D7) Resource creation Initiated
 1/3 | 4:18:49 PM | UPDATE_COMPLETE      | AWS::CDK::Metadata | CDKMetadata 
 2/3 | 4:18:59 PM | CREATE_COMPLETE      | AWS::SNS::Topic    | SNS_TOPIC_ERRORS-dev (SNSTOPICERRORSdevCFB7A9D7) 
 2/3 | 4:19:00 PM | UPDATE_COMPLETE_CLEA | AWS::CloudFormation::Stack | test-stack 
 3/3 | 4:19:01 PM | UPDATE_COMPLETE      | AWS::CloudFormation::Stack | test-stack 

 ✅  test-stack

Stack ARN:
arn:aws:cloudformation:eu-central-1:<accountId>:stack/test-stack/<id>
```

#### Test SNS

You can see the sns topic in AWS Console. Find Services -> SNS (or Simple Notification Service) and look for the created topic

To test this, you can send this command in command line:

```bash 
   aws sns publish --message "{\"domain\": \"foo.bar.com\", \"error\": \"yes\"}" --topic-arn arn:aws:sns:eu-central-1:<AWS_ACCOUNT_ID>:sns_topic_errors-dev    
```
where you can copy-paste the topic-arn from AWS Console!


### Step 2.2 Create DynamoDB

Add DynamoDB table to store things spied on.

cdk diff should result in 
```
$ cdk diff
Stack test-stack
Resources
[+] AWS::DynamoDB::Table spy-table spytable8E974F4C 
```

Then deploy.

```
$ cdk deploy
test-stack: deploying...
test-stack: creating CloudFormation changeset...
 0/3 | 4:55:47 PM | CREATE_IN_PROGRESS   | AWS::DynamoDB::Table | spy-table (spytable8E974F4C) 
 0/3 | 4:55:47 PM | CREATE_IN_PROGRESS   | AWS::DynamoDB::Table | spy-table (spytable8E974F4C) Resource creation Initiated
 0/3 | 4:55:47 PM | UPDATE_IN_PROGRESS   | AWS::CDK::Metadata   | CDKMetadata 
 1/3 | 4:55:48 PM | UPDATE_COMPLETE      | AWS::CDK::Metadata   | CDKMetadata 

 ✅  test-stack

Stack ARN:
arn:aws:cloudformation:eu-central-1:<accountId>:stack/test-stack/<stackId>
```

### Step 2.3, create a lambda that listens the SNS topic and pushes events to DynamoDB

Deploying this requires bootstrapping again: ```cdk bootstrap```, as this uses lambdas that need to be uploaded to the stack.

This is a function that takes on an SNS-message and pushes that to dynamodb. 
There exists already lambda implementation. In this step, the only thing needed is to add that to the stack.

The steps are as follows (and follows my experience on working with AWS): 
   1) make first deployment with minimum rights (LOGS)
       1. check that lambda exists in AWS Console -> Lambdas. Notice that it does not have any triggers
   1) add trigger to the lambda ([file spy-lambda.ts](cdk/dev/constructs/spy-lambda.ts))
       1. test, but still no trigger
   1) add policy to allow lambda to be triggered by SNS
       1. This now ask you, when deploying, if changes in policies is ok.
       1. And seeing from the console, the trigger is now on the lambda 
   1) test, by sending publishing the SNS message
       1. seeing that there are no logs in CloudWatch.
       1. To fix this, give rights to Logs -> deploy
   1) test, by sending publishin the SNS message
       1. notice error in logs saying: `SpyLambda-handler is not authorized to perform: dynamodb:PutItem on resource:`
       1. to fix this, give rights to dynamoDB. And deploy.
   1) notice, again an error in logs
       1. Fix it, deploy and run test again.

Now this is a big step, after which ```cdk diff``` should look like:

```bash
Stack test-stack
IAM Statement Changes
┌───┬─────────────────────────────────────────────────────┬────────┬─────────────────────────────────────────────────────┬─────────────────────────────────────────────────────┬─────────────────────────────────────────────────────┐
│   │ Resource                                            │ Effect │ Action                                              │ Principal                                           │ Condition                                           │
├───┼─────────────────────────────────────────────────────┼────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ + │ ${LambdaExecutionRole4-test-stack-SpyLambda-handler │ Allow  │ sts:AssumeRole                                      │ Service:lambda.amazonaws.com                        │                                                     │
│   │ .Arn}                                               │        │                                                     │                                                     │                                                     │
├───┼─────────────────────────────────────────────────────┼────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ + │ ${SNS_TOPIC_ERRORS-dev}                             │ Allow  │ sns:Publish                                         │ AWS:${LambdaExecutionRole4-test-stack-SpyLambda-han │                                                     │
│   │                                                     │        │                                                     │ dler}                                               │                                                     │
├───┼─────────────────────────────────────────────────────┼────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ + │ ${spy-table.Arn}                                    │ Allow  │ dynamodb:GetItem                                    │ AWS:${LambdaExecutionRole4-test-stack-SpyLambda-han │                                                     │
│   │                                                     │        │ dynamodb:PutItem                                    │ dler}                                               │                                                     │
│   │                                                     │        │ dynamodb:UpdateItem                                 │                                                     │                                                     │
├───┼─────────────────────────────────────────────────────┼────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ + │ ${test-stack-sns-listener-handler.Arn}              │ Allow  │ lambda:InvokeFunction                               │ Service:sns.amazonaws.com                           │ "ArnLike": {                                        │
│   │                                                     │        │                                                     │                                                     │   "AWS:SourceArn": "${SNS_TOPIC_ERRORS-dev}"        │
│   │                                                     │        │                                                     │                                                     │ }                                                   │
├───┼─────────────────────────────────────────────────────┼────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ + │ arn:aws:logs:*:*:*                                  │ Allow  │ logs:CreateLogGroup                                 │ AWS:${LambdaExecutionRole4-test-stack-SpyLambda-han │                                                     │
│   │                                                     │        │ logs:CreateLogStream                                │ dler}                                               │                                                     │
│   │                                                     │        │ logs:PutLogEvents                                   │                                                     │                                                     │
└───┴─────────────────────────────────────────────────────┴────────┴─────────────────────────────────────────────────────┴─────────────────────────────────────────────────────┴─────────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Parameters
[+] Parameter AssetParameters/<StackID>/S3Bucket AssetParameters<StackID>S3BucketF64D0F81: {"Type":"String","Description":"S3 bucket for asset \"<StackID>\""}
[+] Parameter AssetParameters/<StackID>/S3VersionKey AssetParameters<StackID>S3VersionKey16046E45: {"Type":"String","Description":"S3 key for asset version \"<StackId>\""}
[+] Parameter AssetParameters/<StackId>/ArtifactHash AssetParameters<StackId>ArtifactHashB3360325: {"Type":"String","Description":"Artifact hash for asset \"<StackId>\""}

Resources
[+] AWS::IAM::Role LambdaExecutionRole4-test-stack-SpyLambda-handler LambdaExecutionRole4teststackSpyLambdahandler25AE317A 
[+] AWS::IAM::Policy LambdaExecutionRole4-test-stack-SpyLambda-handler/DefaultPolicy LambdaExecutionRole4teststackSpyLambdahandlerDefaultPolicyA84B0AE7 
[+] AWS::Lambda::Function test-stack-sns-listener-handler teststacksnslistenerhandlerA3ADD29E 
[+] AWS::Lambda::Permission test-stack-sns-listener-handler/AllowInvoke:teststackSNSTOPICERRORSdev8BD88E20 teststacksnslistenerhandlerAllowInvoketeststackSNSTOPICERRORSdev8BD88E2013B6D227 
[+] AWS::SNS::Subscription test-stack-sns-listener-handler/SNS_TOPIC_ERRORS-dev teststacksnslistenerhandlerSNSTOPICERRORSdev541BF9D3 
[+] AWS::Logs::LogGroup LogGroup-test-stack-SpyLambda-handler LogGroupteststackSpyLambdahandlerD0934B36 

Outputs
[+] Output lambda-SpyLambda-handler lambdaSpyLambdahandler: {"Value":{"Ref":"teststacksnslistenerhandlerA3ADD29E"},"Export":{"Name":{"Fn::Join":["",["test-stack:Lambda:",{"Ref":"teststacksnslistenerhandlerA3ADD29E"}]]}}}
```

And deploying this requires bootstrapping again: ```cdk bootstrap```, as this uses lambdas that need to be uploaded.

To do get to all this, you need to:

   * create lambda function
   * give it a role with 'assumed by'
   * define log retention to 1 DAY
   * set trigger, if one is defined
   * define policies (SNS, DynamoDB, Logs)

## Success Criteria for Step 2

Publishing SNS message to the topic, by hand, from command line. should succeed. And that can be only seen from logs and DynamoDB:

```
 aws sns publish --message "{\"domain\": \"foo.bar.com\", \"error\": \"yes\"}" --topic-arn arn:aws:sns:eu-central-1:<AWS_ACCOUNT_ID>:sns_topic_errors-dev    
 ```

If logs say: ( a hypothetical situation): 
```
ERROR	Invoke Error	
{
    "errorType": "AccessDeniedException",
    "errorMessage": "User: arn:aws:sts::<AWS_ACCOUNT_ID>:assumed-role/test-stack-LambdaExecutionRole4teststackSpyLambdah-1W0ISM1JA9KIR/test-stack-SpyLambda-handler is not authorized to perform: dynamodb:PutItem on resource: arn:aws:dynamodb:eu-central-1:<AWS_ACCOUNT_ID>:table/a-random-table-that-probably-does-not-exist",
    "code": "AccessDeniedException",
  [code removed for clarity]
}
```
the part `a-random-table-that-probably-does-not-exist` indeed does not exists. Situation is, that table name is not given as environment variable. Please do that.

Success criteria is following entry in the DynamoDB table:

```
Item {3}
	> data Map {2}
   > domain String :	foo.bar.com
	  > error String	:	yes
	> pk String	:	foo.bar.com
	> sk String	:	sns_topic_errors-dev
```

Hooray, you are ready for the next step!

## BEFORE step-3

<to be defined>



## Step 1: create CDK stack:

Previous steps:
   * [step-0](./step-0.md)
   * [step-1](./step-1.md)

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

Run the test with `npm run test:e2e` and see it fail. It fails because the test does not know the DynamoDB TableName 
that is used to store to spy our stack. 

The test needs a name for a DynamoDB Table, but problem is that the table name might be defined based on information
that is available only when deploying CDK stack to AWS. To transfer knowledge from the CDK deployments to the 
end-2-end tests that happen later, we use store CloudFormation details to construct called CloudFormation Output. 

``` 
   https://github.com/pyenv/pyenv 
   https://github.com/pyenv/pyenv-virtualenv
```

Install python version 3.7.6 (or later)

``` bash 
    pyenv install -- list #get list of possible python installations
    pyenv install 3.7.6
```

set python as version and create a virtualenv
```bash 
    pyenv local 3.7.6
    pyenv virtualenv aws
```
activate newly created virtualenv
```bash
    pyenv activate aws
```




## Steps before step-2

To start with next step, do the following:
```bash
    git reset --hard HEAD # to remove the cdk/bin/cdk.ts file.
    git checkout step-2 # to install dependencies
    npm install # to install dependenencies
    run npm run tsc:watch to start watching changes on CDK stack files.
```




## step 0: development environment

### AWS account

You start by creating and AWS account or use existing. 
Also, setup your AWS profile configs according to what is expected. 

in `~/.aws/config` file the following should apply
```bash
[profile e2e]
region = eu-central-1
output = json
source_profile = e2e
```

If you are using a role jump to access your account,
```
role_arn = arn:aws:iam::<AWS ACCOUNT FOR ROLE>:role/<ROLENAME>
mfa_serial = arn:aws:iam::<AWS IAM ACCOUNT>:mfa/<USERNAME>
```

and `~/.aws/credentials`
the following details you get on your AWS Console -> IAM -> Security Credentials
```bash
[e2e]
aws_access_key_id=<access key id>
aws_secret_access_key=<secret access key>
```


## Install AWS-CLI. 

To do stuff on command line, we need AWS Command Line Interface. To install that, I've used the following procedure 

install PyENV and pyenv-virtualenv from 

``` 
   https://github.com/pyenv/pyenv 
   https://github.com/pyenv/pyenv-virtualenv
```

Install python version 3.7.6 (or later)

``` bash 
    pyenv install -- list #get list of possible python installations
    pyenv install 3.7.6
```

set python as version and create a virtualenv
```bash 
    pyenv local 3.7.6
    pyenv virtualenv aws
```
activate newly created virtualenv
```bash
    pyenv activate aws
```

install AWS CLI

```bash
    pip install awscli
```

## Test

This step is ready, when running command 
```bash
   npx cdk --profile=e2e list
```
fails with  message "--app is required either in command-line, in cdk.json or in ~/.cdk.json"

later, you might want to install CDK as global node module by running `npm install -g cdk` after which you can run cdk commands without _npx_: `cdk --profile=e2e list`

```bash
$ aws lambda list-functions --profile e2e
{
    "Functions": []
}
```

incoming                              outgoing 
   `           `----------------`     `==>
    `==>      /                  \   `
             /     AWS            \
            /    Serverless        \
           /     environment        \
          /                          \
         `----------------------------`
```

In the tests, we have defined a type StackConfig where we define all the details that can be stored in CDK to our 
CloudFormation Outputs.  
To fix the error, we need to add tableNames to CloudFormation Outputs 
in file `test-resources.ts`. 

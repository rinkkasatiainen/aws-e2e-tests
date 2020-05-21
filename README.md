# aws-e2e-tests
This repository is step by step guide in creating a serverless environment using AWS CDK, while creating end2end tests and unit tests. 

If you need help / copy-paste code, check file [step-tips.md](step-tips.md)

To follow the progress, check out [TODO list](todo.md)

This env file is added to `.gitignore`, and wont be overwritten when changing branches between steps. It is used to 
store all AWS environment specific details. 

# Step 1: create CDK stack:

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

In the tests, we have defined a type StackConfig where we define all the details that can be stored in CDK to our 
CloudFormation Outputs.  
To fix the error, we need to add tableNames to CloudFormation Outputs 
in file `test-resources.ts`. 

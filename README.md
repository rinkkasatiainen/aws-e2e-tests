# aws-e2e-tests

This repository is step by step guide in creating a serverless environment using AWS CDK, while creating end2end tests and unit tests. 

# Step 1: create CDK stack:

## install NPM dependencies

..by running npm install

## create first stack

To start, add a file 'cdk.json' with content:
```json
{
  "app": "node cdk/bin/cdk.js"
}
```

Then create a file 'cdk/bin/cdk.ts' with following content

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

## compile typescript to Javascript for deployment

The typescript CDK stack needs to be compiled to JS. For that, execute command ```npm run tsc``` that does exactly that.

## deploy

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

# step 0: development environment

## AWS account

You start by creating and AWS account or use existing. Also, setup your AWS profile configs according to what is expected. The last to parts (role_arn and mfa_serial are optional - used if you do a role jump to dev role)

in `~/.aws/config` file the following should apply
```bash
[profile e2e]
region = eu-central-1
output = json
source_profile = e2e
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
    pip install aws-cli
```

## Test

This step is ready, when running command 
```bash
   cdk --profile=e2e list
```
fails with  message "--app is required either in command-line, in cdk.json or in ~/.cdk.json"


# Testing in AWS environment

## End-2-end testing on this plugin.

To understand the core of all testing, regarding to what and how, it is adviced (by Aki S.) to watch a great video by 
Sandi Metz on [Magic Tricks on testing](https://www.youtube.com/watch?v=URSWYvyc42M). With that information, the 
following applies

### Testing quadrants

Separating everything to either a query or a command, is the core of understanding what to test, and how.

* Query / a function that has a return value
* Command / a function that has a side-effect

And testing these, needs to be done differently  

```

/--------------------+------------------+-------------------\
|   type             |     QUERY        |    COMMAND        |
+--------------------+------------------+-------------------+
|  Incoming          |  Verify the      |  Verify direct    |
|                    |  return value    |  side-effect      |
+--------------------+------------------+-------------------+
|  Sent to self      |     do not       |      do not       |
|                    |      test        |       test        |
+--------------------+------------------+-------------------+
|  Outgoing          |     do not       |      verify       |
|                    |      test        |    message is     |
|                    |                  |       sent        |
\--------------------+------------------+-------------------/
```

Taking this to AWS end-2-end testing, all the same applies.

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

when thinking the whole as a unit, the following rules apply.

1) we execute tests by sending messages to the Serverless environment. Either via 
    * invoking lambdas directly (in case where that is appropriate), or
    * sending an event to SNS topic.
1) we create test doubles around the unit -> meaning we fake all the external connections.



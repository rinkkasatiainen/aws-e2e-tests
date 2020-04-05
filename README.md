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

# step 0: development environment

### Setup direnv

Make sure you have [direnv](https://direnv.net/) installed.


Then you have 2 options, 
   1)  copy [example 1 .envrc.example file](./.envrc.example) as .envrc file, and set your credentials there.
   2)  copy [.envrc.script](./.envrc.script) as .envrc and create file .aws_profile with your profile information
       * you could also encrypt that file contents with AES_ENC_KEY (you need to setup that env variable) to file 
       .aws_profile.enc, which would then be used to set up your AWS environment variables.   

When direnv is used correctly,  you should see

```bash
   $ direnv allow
   direnv: export +AWS_ACCESS_KEY_ID +AWS_DEFAULT_REGION +AWS_SECRET_ACCESS_KEY +AWS_SESSION_TOKEN_DURATION
```
and you'll see the AWS keys in your environment variables, when on the given directory:

```bash
   $ env | grep AWS
```

### Install AWS-CLI (version 2)

To install AWS CLI, follow the [official install instructions](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)

## Test

This step is ready, when running command 
```bash
   npx cdk --profile=e2e list
```
fails with  message "--app is required either in command-line, in cdk.json or in ~/.cdk.json"

later, you migth want to install CDK as global node module by running `npm install -g cdk` after which you can run cdk commands without _npx_: `cdk --profile=e2e list`

```bash
$ aws lambda list-functions --profile e2e
{
    "Functions": []
}
```

## Harder way - using AWS profiles and installing AWS CLI version 1

### AWS account

You start by creating and AWS account or use existing. Also, setup your AWS profile configs according to what is expected. The last to parts (role_arn and mfa_serial are optional - used if you do a role jump to dev role)

in `~/.aws/config` file the following should apply
```bash
[profile e2e]
region = eu-central-1
output = json
source_profile = e2e
```

and `~/.aws/credentials`
the following details you get on your AWS Console -> IAM -> Security Credentials
```bash
[e2e]
aws_access_key_id=<access key id>
aws_secret_access_key=<secret access key>
```

### Install AWS-CLI (version 1 - depracated). 

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

# aws-e2e-tests

This repository is step by step guide in creating a serverless environment using AWS CDK, while creating end2end tests and unit tests. 


# step 0: development environment

## AWS account

You start by creating and AWS account or use existing. Also, setup your AWS profile configs according to what is expected. The last to parts (role_arn and mfa_serial are optional - used if you do a role jump to dev role)

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

later, you migth want to install CDK as global node module by running `npm install -g cdk` after which you can run cdk commands without _npx_: `cdk --profile=e2e list`

```bash
$ aws lambda list-functions --profile e2e
{
    "Functions": []
}
```

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



import * as IAM from '@aws-cdk/aws-iam';
import * as Lambda from '@aws-cdk/aws-lambda';
import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as Logs from '@aws-cdk/aws-logs';
import * as CDK from '@aws-cdk/core';
import * as path from 'path';

export interface EnvVars {
    NODE_ENV: string;
}

type EnvVarKey = 'NODE_ENV';

export interface LambdaProps {
    policies: IAM.PolicyStatement[];
    environmentVars: { [key in EnvVarKey]: string };
    triggers: SnsEventSource[];
    functionName: string;
    handler: string;
}

const buildLambdaFunction: (scope: CDK.Stack, props: LambdaProps) => Lambda.Function =
    (scope, props) => {
        const { handler, functionName } = props;
        const { policies } = props;

        const [filename, method] = handler.split('.');
        const id = `${scope.stackName}-${filename}-${method}`;
        const lambdaName = `${scope.stackName}-${functionName}-${method}`;

        // Add policies
        const role: IAM.Role = new IAM.Role(scope, `LambdaExecutionRole4-${lambdaName}`, {
            assumedBy: new IAM.ServicePrincipal('lambda.amazonaws.com'),
        });
        policies.forEach(p => role.addToPolicy(p));

        // Create Lambda function!
        const lambda = new Lambda.Function(scope, id, {
            functionName: lambdaName,
            description: `${functionName}.${method} for testStack`,
            code: Lambda.Code.fromAsset(path.join(__dirname, '../dev/lambdas')),
            role,
            memorySize: 128,
            handler,
            runtime: Lambda.Runtime.NODEJS_10_X,
            timeout: CDK.Duration.seconds(15),
            environment: { ...props.environmentVars },
        });

        // Create Log Group! And set retention!
        const retention = Logs.RetentionDays.ONE_DAY;
        new Logs.LogGroup(scope, `LogGroup-${lambdaName}`, {
            removalPolicy: CDK.RemovalPolicy.DESTROY,
            logGroupName: `/aws/lambda/${lambda.functionName}`,
            retention,
        });

        // Add Triggers - like SNS Topic or CloudWatch Alamrs
        const { triggers } = props;
        (triggers || []).forEach( t => lambda.addEventSource(t));

        // Add Lambda to CloudFormation Output. To be used in Tests
        new CDK.CfnOutput(scope, `lambda-${lambdaName}`, {
            value: lambda.functionName,
            exportName: `${scope.stackName}:Lambda:${lambdaName}`,
        });

        return lambda;
    };

export const createLambda: (x: CDK.Stack) =>
    (y: { envVars: EnvVars }) =>
        (z: LambdaProps) =>
            Lambda.Function =
    scope => ({ envVars }) => props => {
        const { environmentVars } = props;

        return buildLambdaFunction(scope, {
            ...props, environmentVars: {
                ...environmentVars,
                ...envVars,
            },
        });

    };

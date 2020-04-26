import * as IAM from '@aws-cdk/aws-iam';
import * as Lambda from '@aws-cdk/aws-lambda';
import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as Logs from '@aws-cdk/aws-logs';
import * as CDK from '@aws-cdk/core';

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
    assetFolder: string;
}

const buildLambdaFunction: (scope: CDK.Stack, props: LambdaProps) => Lambda.Function =
    (scope, props) => {
        // handler is used when building the Lambda Construct, functionName is used as base name
        const { handler, functionName } = props;
        const { policies, assetFolder } = props;

        const [filename, method] = handler.split('.');
        const id = `${scope.stackName}-${filename}-${method}`;
        // create very specific name for lambda. Otherwise would user `id${randomID}. That, too, would be a good stragegy
        const lambdaName = `${scope.stackName}-${functionName}-${method}`;

        // create a Role Construct
        const role: IAM.Role = new IAM.Role(scope, `LambdaExecutionRole4-${lambdaName}`, {
            assumedBy: new IAM.ServicePrincipal('lambda.amazonaws.com'),
        });
        // add policies to the Role
        policies.forEach(p => role.addToPolicy(p));

        // Create Lambda Construct!
        const lambda = new Lambda.Function(scope, id, {
            functionName: lambdaName,
            description: `${functionName}.${method} for testStack`,
            code: Lambda.Code.fromAsset(assetFolder),
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

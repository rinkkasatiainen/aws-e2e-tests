import * as DynamoDB from '@aws-cdk/aws-dynamodb';
import * as CDK from '@aws-cdk/core';
import * as ApiGateway from '@aws-cdk/aws-apigateway';
import {createLambda, LambdaProps} from "../../lib/constructs/lambdas";
import * as IAM from "@aws-cdk/aws-iam";
import {policyForDynamoRW, policyLogs} from "../../lib/constructs/policies";
import {SnsEventSource} from "@aws-cdk/aws-lambda-event-sources";
import path from "path";

const createFakeLambda:
    (name: string) => (z: { spyTable: DynamoDB.ITable }) => LambdaProps =
    name => ({spyTable}) => {
        const policies: IAM.PolicyStatement[] = [
            policyLogs(),
            policyForDynamoRW([spyTable.tableArn])
        ];

        const environmentVars = {};

        const triggers: SnsEventSource[] = [];

        return {
            assetFolder: path.join(__dirname, '../lambdas'),
            policies,
            environmentVars,
            triggers,
            functionName: `Fake${name.toUpperCase()}`,
            handler: `${name}.handler`,
        };
    }

export const createFakeApi:
    (x: CDK.Stack, props: { lambdas: Array<{ filename: string }> }) =>
        (y: DynamoDB.ITable) =>
            ApiGateway.RestApi =
    (scope, props) => spyTable => {

        const {lambdas} = props;
        const restApiName = `${scope.stackName}-FakeApi`;
        const api: ApiGateway.RestApi = new ApiGateway.RestApi(scope, restApiName, {restApiName});
        for (const lambda of lambdas) {
            const {filename: lambdaName} = lambda;

            const fakeLambda = createLambda(scope)({})(
                createFakeLambda(lambdaName)({spyTable})
            );
            fakeLambda.addPermission('InvokeByApiGateway', {
                principal: new IAM.ServicePrincipal('apigateway.amazonaws.com'),
                sourceArn: api.arnForExecuteApi(),
            });

            const resource = api.root.addResource(`${lambdaName.toLowerCase()}`);
            const proxyResource: ApiGateway.IResource = resource.addResource('{proxy+}');
            proxyResource.addMethod('Any', new ApiGateway.LambdaIntegration(fakeLambda));

            const urlForFakeRoot = `${api.url}${resource.path.split('/')[1]}`;
            new CDK.CfnOutput(scope, `${lambdaName}Api`, {
                value: urlForFakeRoot,
                exportName: `${scope.stackName}:${lambdaName}URL`,
            });
        }

        return api;
    };

import AWS from 'aws-sdk';

export const region: string = process.env.DEFAULT_AWS_REGION || process.env.AWS_REGION || 'eu-central-1';

export interface StackConfig {
    lambdaNames: string[]; // All lambdas that can be warmed up!
    spyTableName: string;  // This is the name of the spy table. We need to create this.
    snsErrorTopic: string;
    ResourcesTable: string;
    SpyTableName: string;
    ErrorsTable: string;
    lambdateststackdevFailsMiserablyhandler: string;
}

export const fetchStackConfiguration: (x: { StackName: string }) => Promise<StackConfig> =
    async ({ StackName }) => {
        const cf = new AWS.CloudFormation({ region });
        const { Stacks } = await cf.describeStacks({ StackName }).promise();
        if (!Stacks) {
            throw new Error(`Unknown stack "${StackName}"!`);
        }
        const stackOutputs = (Stacks && Stacks[0].Outputs) || [];
        const lambdaNames = stackOutputs
            .filter(output => (output.ExportName || '').includes(':Lambda:'))
            .map(output => output.OutputValue);

        return stackOutputs.reduce(
            (outputs: any, { OutputKey, OutputValue }) => ({
                ...outputs,
                [OutputKey as string]: OutputValue,
            }),
            { lambdaNames }
        );
    };

export class DocumentClient {
}
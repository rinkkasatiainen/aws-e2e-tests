import * as IAM from '@aws-cdk/aws-iam';


// TODO: Step 2.3 Give Access Rights of 'sns:Publish'
export const policyForSns: (topicArns: string[]) => IAM.PolicyStatement =
    resources => {
        const policy = new IAM.PolicyStatement();
        policy.addActions( 'sns:Publish');
        policy.addResources(...resources);

        return policy;
    };

export const policyForDynamoScan: (tableArns: string[]) => IAM.PolicyStatement =
    resources => {
        const policy = new IAM.PolicyStatement();
        policy.addActions('dynamodb:Scan');
        policy.addResources(...resources);

        return policy;
    };

export const policyForDynamoDelete: (tableArns: string[]) => IAM.PolicyStatement =
    resources => {
        const policy = new IAM.PolicyStatement();
        policy.addActions('dynamodb:DeleteItem');
        policy.addResources(...resources);

        return policy;
    };

export const policyForDynamoRW: (tableArns: string[]) => IAM.PolicyStatement =
    resources => {
        const policy = new IAM.PolicyStatement();
        policy.addActions('dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:GetItem');
        policy.addResources(...resources);

        return policy;
    };

// TODO: Step 2.3 Give Access Rights of 'logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'
export const policyLogs: () => IAM.PolicyStatement =
    () => {
        const policy = new IAM.PolicyStatement();
        policy.addActions('logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents');
        policy.addResources('arn:aws:logs:*:*:*');

        return policy;
    };

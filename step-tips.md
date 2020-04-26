# In this file, the code is added that needs to be done in each step
[back to readme.md](README.md)

## Step 3.1:

### `cdk.ts`
create stack in cdk.ts.
```typescript
// TODO: Step 3.1 - add fails-miserably code to the stack.
 const { tables } =  createStack(stack, { topics });
```

### `e2e-stack.ts`


```typescript
export const createStack: (stack: CDK.Stack, p: CreateStackProps) => E2EStackOutput =
    (scope, { topics: { SNS_TOPIC_ERRORS } }) => {
        const tables = createTables(scope);

        // TODO: Step 3.1 - Add fails miserably lambda
        const { resourcesTable } = tables;
        createLambda
        (scope)
        ({ envVars: { NODE_ENV: 'dev' } })
        (failsMiserablyLambda({ resourcesTable })({ SNS_TOPIC_ERRORS }));createLambda
    
        return tables
    };
```

### 'cdk/lib/constructs/lambdas/fails-miserably.ts'

Create the lambda props, as in step 2.3. 

```typescript
type LambdaCreator =
    (x: NeededTables) => (y: Topics) => LambdaProps;

interface NeededTables extends PossibleTables {
    resourcesTable: DynamoDB.ITable;
}

export interface Topics extends PossibleSnsTopics {
    SNS_TOPIC_ERRORS: SNS.ITopic;
}

export const failsMiserablyLambda: LambdaCreator =
    ({ resourcesTable }) => ({ SNS_TOPIC_ERRORS }) => {

        const policies: IAM.PolicyStatement[] = [
            policyForSns([SNS_TOPIC_ERRORS.topicArn]),
            policyLogs(),
            policyForDynamoRW([resourcesTable.tableArn]),
        ];

        // Step 3.1: Add envVars that the labda uses / see dist/fails-miserably.ts
        const environmentVars = {
            NODE_ENV: 'dev',
            RESOURCE_TABLE_NAME: resourcesTable.tableName,
            ERRORS_SNS_ARN: SNS_TOPIC_ERRORS.topicArn,
        };

        // Step 3.1: no event sources
        const triggers: SnsEventSource[] = [];

        return {
            assetFolder: path.join(__dirname, '../../../../dist'),
            policies,
            environmentVars,
            triggers,
            functionName: 'FailsMiserably',
            handler: 'fails-miserably.handler',
        };
    };
```


## Step 3.2

To know table names in the tests, that can have whatever is defined in the CDK stack, we can create CloudFormation Outputs to store 
tablenames"

### `cdk.ts`

```typescript
// Add ResourcesTable to CloudFormatioin so that it can be fetched at test case!
const { resourcesTable } = tables;
addCfnOutput(stack)('ResourcesTable')({
    value: resourcesTable.tableName,
    exportName: `${stack.stackName}:Table:ResourcesTable`,
});
```

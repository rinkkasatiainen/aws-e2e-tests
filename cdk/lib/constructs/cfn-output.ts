import * as CDK from '@aws-cdk/core';
import { StackConfigKeys } from '../../test/test-aws-config';

export const addCfnOutput: (stack: CDK.Stack) => (x: StackConfigKeys) => (y: CDK.CfnOutputProps) => void =
    stack => id => props => {
        // tslint:disable-next-line:no-unused-expression
        new CDK.CfnOutput(stack, id, props);
    };

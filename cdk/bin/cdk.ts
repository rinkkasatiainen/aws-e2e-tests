import * as CDK from '@aws-cdk/core';
import { createStack } from '../lib/e2e-stack';
import { env } from './env';

const app = new CDK.App();

class E2EStack extends CDK.Stack {

  public constructor(parent: CDK.App, id: string) {
    super(parent, id, {
      tags: { aTag: 'a-value' },
    });
  }
}

const stack = new E2EStack(app, `test-stack-${env}`);

createStack(stack, {});

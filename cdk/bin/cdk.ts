import * as CDK from '@aws-cdk/core';

const app = new CDK.App();

class E2EStack extends CDK.Stack {

  public constructor(parent: CDK.App, id: string){
    super(parent, id, {
      tags: {aTag: "a-value"}
    });
  }
}

new E2EStack(app, "test-stack");

# TODO

This contains things that will be learned during the workshop

## Outline

   * ~~create a new CDK Stack (step-1)~~
   * create ways to spy on messages sent to SNS topics (step-2)
   * create a lambda that listens to ERROR topic and pushes entries to DynamoDB (step-3)
       * create e2e test for this
       * create the lambda
   * create a fake HTTP endpoint for e2e testing purposes (step-4)
   * create a test for lambda that retrieves data and (step-5) 
       * publishes an event to ERROR topic, if error happens
       * publishes an event to SUCCESS topic, if lambda succeeds
   * create the lambda (step-6)
   
   
## Extra topics

These are advanced topics, that are important for production use. 

   * Bundle JS files using Webpack
   * Use Lambda Layers to minimize lambda function code
   * advanced Webpack - tree shaking
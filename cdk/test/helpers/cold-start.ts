import { testExecute } from './execute';

const execute = testExecute({ region: 'eu-central-1' });

const warmLambdas: { [name: string]: boolean } = {};

export const warmUpLambdas: (props: { lambdaNames: string[] }, filterBy?: string[]) => Promise<void> =
    async ({ lambdaNames }, filterBy) => {
        console.log(`Warming up Lambdas`);
        const f = filterBy || [];
        const lambdas = lambdaNames.map(lambdaName => () => {
            if (!!warmLambdas[lambdaName]) {
                console.log(`Lambda already warm: ${lambdaName}`);

                return Promise.resolve();
            }
            if (f.filter(it => lambdaName.includes(it)).length > 0) {
                console.log(`Warming up Lambda: ${lambdaName}`);
                warmLambdas[lambdaName] = true;

                return execute.invokeLambda({ FunctionName: lambdaName });
            }

            return Promise.resolve();
        });
        await Promise.all(lambdas.map(fn => fn()));

        console.log('Lambdas all warmed up!');
    };


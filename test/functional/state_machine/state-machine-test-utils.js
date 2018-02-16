const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');


class StateMachineTestUtils {

    constructor() {
        this.lambda_names = [
            'pickrebillstobill',
            'billtohold',
            'recovertohold',
            'holdtopending',
            'pendingtoshipped',
            'shippedtodelivered',
            'deliveredtoarchive',
            'holdtoarchive',
            'rebilltoarchive',
            'recovertoarchive'
        ];
    }

    flush(filter) {
        let lambda_names = this.lambda_names;

        if (filter) {
            lambda_names = this.lambda_names.filter(name => filter.includes(name));
        }

        let all_function_executions = arrayutilities.map(lambda_names, (lambda_name) => {
            let lambda = lambdautilities.getLambdaInstance(lambda_name);
            let function_name = Object.keys(lambda); // function is the first property of the handler

            return lambda[function_name](null, null, () => {
            })
        });

        return Promise.all(all_function_executions).then((results) => {
            return timestamp.delay(0.3 * 1000)().then(() => results);
        });
    }


}

module.exports = new StateMachineTestUtils();


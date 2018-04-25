const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
const lambdaprovider = new LambdaProvider();
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

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
			let lambda = lambdaprovider.getLambdaInstance(lambda_name);

			du.highlight("Lambda is ", lambda);
			return lambda(null, null, () => {})
		});

		return Promise.all(all_function_executions).then((results) => {
			return timestamp.delay(0.3 * 1000)().then(() => results);
		});
	}


}

module.exports = new StateMachineTestUtils();


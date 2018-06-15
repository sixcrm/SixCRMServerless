const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
const lambdaprovider = new LambdaProvider();
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const BBPromise = require('bluebird');

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

		let all_function_executions = BBPromise.mapSeries(lambda_names, (lambda_name) => {
			let lambda = lambdaprovider.getLambdaInstance(lambda_name);

			return lambda(null, null, () => {})
		});

		return all_function_executions.then((results) => {
			return timestamp.delay(0.3 * 1000)().then(() => results);
		});
	}


}

module.exports = new StateMachineTestUtils();


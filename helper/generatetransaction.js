require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const TransactionGenerator = global.SixCRM.routes.include('helpers','transaction/generator/Generator.js');


let configuration = {
	environment: 'development',
	account: 'eefdeca6-41bc-4af9-a561-159acb449b5e',
	transaction_count: 1
};

let cli_parameters = {
	'environment': /^--environment=.*$/,
	'transaction_count': /^--count=.*$/,
	'account': /^--account=.*$/
}

objectutilities.map(cli_parameters, key => {

	let regex = cli_parameters[key];

	arrayutilities.find(process.argv, (argument) => {
		if(stringutilities.isMatch(argument, regex)){
			configuration[key] = argument.split('=')[1];
			return true;
		}
		return false;
	});

});


let parameters = {
	endpoint: 'https://'+configuration.environment+'-api.sixcrm.com/',
	account: configuration.account,
	access_key: '8SUJAY9BR17LN2QUJAMLQ6NDXZ8RTCQ7SS42RTAE',
	secret_key: 'fb809cd5cb5342222c9bcd95ba7e5510ecb033e5',
	campaign: '5c593d31-5001-4faf-8ea2-e8c1a1f85f04',
	product_schedule: '77c72379-de6f-449d-96b6-ac888852729f'
};

let promises = [];

for(let i = 0; i < configuration.transaction_count; i++){

	let transactionGenerator = new TransactionGenerator();

	promises.push(transactionGenerator.issue(parameters));

}

Promise.all(promises).then(() => {
	//du.info(promises);
	du.info('Complete');
	return true;
}).catch((ex) => {

	du.error(ex);

});

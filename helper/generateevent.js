
require('@sixcrm/sixcrmcore');

//const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;

let configuration = {
	environment: 'development',
	account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
	user: 'system@sixcrm.com',
	event_type: 'test',
	context: global.SixCRM.routes.include('root', 'helper/events/test.context.json')
};

let cli_parameters = {
	'environment': /^--environment=.*$/,
	'transaction_count': /^--count=.*$/,
	'account': /^--account=.*$/,
	'user': /^--user=.*$/,
	'event_type': /^--event_type=.*$/,
	'context': /^--context=.*$/
}

objectutilities.map(cli_parameters, key => {

	let regex = cli_parameters[key];

	arrayutilities.find(process.argv, (argument) => {
		if (stringutilities.isMatch(argument, regex)) {
			configuration[key] = argument.split('=')[1];
			return true;
		}
		return false;
	});

});

let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
new EventPushHelperController().pushEvent({
	event_type: configuration.event_type,
	context: configuration.context
});

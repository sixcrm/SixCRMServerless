
require('../SixCRM.js');

//const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');

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

let eventHelperController = new EventHelperController();

eventHelperController.pushEvent({
	context: configuration.context,
	event_type: configuration.event_type
});

require('@sixcrm/sixcrmcore');
const APNProvider = global.SixCRM.routes.include('controllers', 'providers/apn-provider.js');
const apnprovider = new APNProvider();
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

let message = process.argv[2];
let user = process.argv[3];

if (!message) {
	du.info('Message is required');
	process.exit();
}

if (!user) {
	du.info('User (email) is required');
	process.exit();
}

//Flesh out the user.  Make sure device tokens are set

apnprovider.sendNotifications(user, message).then((result) => {
	du.info('Notification Result', result);
	return result;
})
	.catch((error) => {
		du.warning('Error:', error);
	});

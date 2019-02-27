require('module-alias/register');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const ShippoTracker = require('@lib/controllers/vendors/ShippoTracker').default;
const shippoTracker = new ShippoTracker('shippo_test_230ff62035f444db3dac50171f0042656ac3fc34');

// Use 'shippo' as carrier and 'SHIPPO_<status>' to get back the status you want.
shippoTracker.track('shippo', 'SHIPPO_TRANSIT')
	.then(result => {
		return du.info(result);
	})
	.catch(err => {
		du.error(err);
	});

'use strict';

const request = require('request-promise');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class IPCheckController {

	checkIP() {

		du.debug('Check IP');

		return request("https://api.ipify.org")
			.then(ipAddress => ({ ipAddress }));

	}
}

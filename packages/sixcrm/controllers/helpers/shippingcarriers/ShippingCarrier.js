const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
//const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

module.exports = class ShippingCarrierHelperController {

	constructor() {

	}

	determineCarrierFromTrackingNumber(tracking_number) {
		if (!_.isString(tracking_number)) {
			throw eu.getError('server', 'Expected tracking number to be a string.');
		}

		tracking_number = tracking_number.replace(/[^a-zA-Z0-9]/gi, '');

		let carrier_matches = [];

		if (this.isUSPS(tracking_number)) {
			carrier_matches.push('USPS');
		}

		if (this.isFedEx(tracking_number)) {
			carrier_matches.push('FedEx');
		}

		if (this.isUPS(tracking_number)) {
			carrier_matches.push('UPS');
		}

		if (this.isDHL(tracking_number)) {
			carrier_matches.push('DHL');
		}

		if (carrier_matches.length < 1) {
			carrier_matches.push('Unknown');
		}

		return carrier_matches;

	}

	isUSPS(tracking_number) {
		let matches = tracking_number.match(/^[98][234][0-9]{20}$/g);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		matches = tracking_number.match(/^82[0-9]{8}$/g);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		return false;

	}

	isFedEx(tracking_number) {
		let matches = tracking_number.match(/^[0-9]{12,15}$/g);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		return false;

	}

	isUPS(tracking_number) {
		let matches = tracking_number.match(/^1Z[a-z0-9]{16}$/gi);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		matches = tracking_number.match(/^MI[0-9]{6}[a-z0-9]{1,22}$/gi);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		matches = tracking_number.match(/^T[0-9]{10}$/gi);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		matches = tracking_number.match(/^[0-9]{12}$/gi);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		matches = tracking_number.match(/^[0-9]{9}$/gi);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		return false;

	}

	isDHL(tracking_number) {
		let matches = tracking_number.match(/^[0-9]{10}$/gi);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		matches = tracking_number.match(/^[a-z]{2}[0-9]{18}$/gi);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		return false;

	}

}


const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const numberutilities = require('@6crm/sixcrmcore/util/number-utilities').default;

module.exports = class RebillHelperUtilities {

	constructor(){

	}

	calculateDayInCycle(created_at){

		du.debug('Calculate Day In Cycle');

		if(_.isUndefined(created_at) || _.isNull(created_at)){

			created_at = null;

			let session = this.parameters.get('session', {fatal: false});

			if(!_.isNull(session)){

				created_at = session.created_at;

			}

		}

		if(timestamp.isISO8601(created_at)){

			let day = timestamp.getDaysDifference(created_at);

			this.parameters.set('day', day);

			return day;

		}

		throw eu.getError('server', 'created_at is not a proper ISO-8601');

	}

	calculateAmount(){

		du.debug('Calculate Amount');

		let products = this.parameters.get('transactionproducts', {fatal: false});

		let amount = 0.0;

		if(!_.isNull(products) && arrayutilities.nonEmpty(products)){
			amount = arrayutilities.reduce(products, (sum, object) => {
				return sum + numberutilities.formatFloat((object.amount * object.quantity), 2);
			}, amount);
		}

		this.parameters.set('amount', numberutilities.formatFloat(amount, 2));

		return Promise.resolve(true);

	}

	calculateBillAt(){

		du.debug('Calculate Bill At');

		let bill_day = this.parameters.get('nextproductschedulebilldaynumber');

		let session_start = parseInt(timestamp.dateToTimestamp(this.parameters.get('session').created_at));

		let additional_seconds = timestamp.getDayInSeconds() * bill_day;

		let bill_date = timestamp.toISO8601(session_start + additional_seconds);

		du.warning(this.parameters.get('session').created_at+' plus '+bill_day+' days should equal '+bill_date);

		this.parameters.set('billdate', bill_date);

		return Promise.resolve(true);

	}

}

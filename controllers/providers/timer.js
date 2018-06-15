
const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;

module.exports = class Timer {

	constructor(){

	}

	set(){

		this.start = timestamp.createTimestampMilliseconds();

	}

	get(force){

		if(!_.has(this, 'start')){

			throw eu.getError('server','You must set the timer with "set" before calling "get".');

		}

		let now = timestamp.createTimestampMilliseconds();

		let elapsed = (now - this.start);

		if(force){

			let verbose_setting = process.env.SIX_VERBOSE;

			process.env.SIX_VERBOSE=2;
			du.info('Execution Time: '+elapsed+' ms');
			process.env.SIX_VERBOSE=verbose_setting;

		}else{

			du.info('Execution Time: '+elapsed+' ms');

		}


		return elapsed;

	}


}

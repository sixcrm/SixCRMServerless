const _  = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

module.exports = class AWSProvider {

	constructor(){

	}

	instantiateAWS(){
		if(!_.has(this, 'AWS')){
			this.AWS = require('aws-sdk');
		}

	}

	getRegion(){
		return global.SixCRM.configuration.site_config.aws.region;

	}

	hasCredentials(fatal){
		fatal = (_.isUndefined(fatal))?true:fatal;

		let validation = global.SixCRM.validate(process.env, global.SixCRM.routes.path('model','general/process_env/hasawscredentials.json'), false)

		if(!validation){

			if(fatal){
				throw eu.getError('server', 'Missing Credentials in process.env');
			}

			du.warning('Missing Credentials in process.env');

			return false;

		}

		return true;

	}

}

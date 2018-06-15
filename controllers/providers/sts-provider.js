
const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

const random = require('@sixcrm/sixcrmcore/util/random').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js')

module.exports = class STSProvider extends AWSProvider {

	constructor(){

		super();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.sts = new this.AWS.STS({
			apiVersion: '2011-06-15'
		});

	}

	assumeRole(parameters){

		du.debug('Assume Role');

		let transcribe_parameters = {
			required:{
				RoleArn:'RoleArn'
			},
			optional:{
				DurationSeconds: 'DurationSeconds',
				RoleSessionName: 'RoleSessionName',
				Policy:'Policy',
				ExternalId:'ExternalId'
			}
		};

		let new_parameters = objectutilities.transcribe(transcribe_parameters.required, parameters, {}, true);

		new_parameters = objectutilities.transcribe( transcribe_parameters.optional, parameters, new_parameters, false);

		if(!_.has(new_parameters.RoleSessionName)){
			new_parameters.RoleSessionName = random.createRandomString(20);
		}

		global.SixCRM.validate(new_parameters, global.SixCRM.routes.path('model', 'deployment/sts/assumerolerequest.json'))

		return new Promise((resolve) => {

			this.sts.assumeRole(new_parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

}

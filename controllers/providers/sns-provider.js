
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class SNSProvider extends AWSProvider{

	constructor(){

		super();

		this.instantiateSNS();

	}

	instantiateSNS(){

		du.debug('Instantiate SNS');

		let sns_region = (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'sns.region'))?global.SixCRM.configuration.site_config.sns.region:this.getRegion();
		let parameters = {
			apiVersion: 'latest',
			region: sns_region
		};

		if(objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'sns.endpoint')){
			parameters.endpoint = global.SixCRM.configuration.site_config.sns.endpoint;
		}

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.sns = new this.AWS.SNS(parameters);

	}

	createTopic(parameters){

		du.debug('Create Topic');

		let params = objectutilities.transcribe(
			{
				Name:'Name'
			},
			parameters,
			{},
			true
		);

		return new Promise((resolve, reject) => {
			this.sns.createTopic(params, function(error, data) {
				if (error){
					du.error(error);
					return reject(error);
				}
				return resolve(data);
			});
		});

	}

	addPermission(parameters){

		du.debug('Add Permission');

		let params = objectutilities.transcribe(
			{
				AWSAccountId:'aws_account_id',
				ActionName: 'action_name',
				Label:'label',
				TopicArn:'topic_arn'
			},
			parameters,
			{},
			true
		);

		return new Promise((resolve, reject) => {
			this.sns.addPermission(params, function(error, data) {
				if (error){
					du.error(error);
					return reject(error);
				}
				return resolve(data);
			});
		});

	}

	subscribe(parameters){

		du.debug('Subscribe');

		let params = objectutilities.transcribe(
			{
				Protocol:'Protocol',
				TopicArn:'TopicArn'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				Endpoint:'Endpoint',
			},
			parameters,
			params
		);

		return new Promise((resolve, reject) => {
			this.sns.subscribe(params, function(error, data) {
				if (error){
					du.error(error);
					return reject(error);
				}
				return resolve(data);
			});
		});

	}

	setSubscriptionAttributes(parameters){

		du.debug('Set Subscription Attributes');

		let params = objectutilities.transcribe(
			{
				AttributeName: 'AttributeName',
				SubscriptionArn: 'SubscriptionArn'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				AttributeValue:'AttributeValue',
			},
			parameters,
			params
		);

		return new Promise((resolve, reject) => {

			this.sns.setSubscriptionAttributes(params, function(error, data) {
				if (error){
					du.error(error);
					return reject(error);
				}
				return resolve(data);
			});

		});

	}

	publish(parameters){

		du.debug('Publish');

		let params = objectutilities.transcribe(
			{
				Message:'Message'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				MessageAttributes:'MessageAttributes',
				MessageStructure: 'MessageStructure',
				PhoneNumber: 'PhoneNumber',
				Subject:'Subject',
				TargetArn: 'TargetArn',
				TopicArn: 'TopicArn'
			},
			parameters,
			params,
			false
		);

		return new Promise((resolve, reject) => {
			this.sns.publish(params, function(error, data) {
				if (error){
					du.error(error);
					return reject(error);
				}
				return resolve(data);
			});
		});

	}

	sendSMS(text, phone_number) {

		return new Promise((resolve, reject) => {
			let params = {
				Message: text,
				PhoneNumber: phone_number,
			};

			du.debug('Sending SMS message with parameters', params);

			this.sns.publish(params, (error, data) => {
				if (error) {
					du.debug('SNS Error!', error);

					return reject(error);
				}

				if (data) {
					du.debug('SNS Success:', data);

					return resolve(data);
				}
			});
		});

	}

}

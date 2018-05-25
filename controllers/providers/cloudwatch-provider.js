const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
//const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');

const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class CloudwatchProvider extends AWSProvider{

	constructor(){

		super();

		this.instantiateAWS();

		this.cloudwatchlogs = new this.AWS.CloudWatchLogs({
			apiVersion: '2014-03-28',
			region: this.getRegion()
		});

	}

	putSubscriptionFilter(parameters){

		du.debug('Put Subscription Filter');

		return new Promise((resolve) => {

			this.cloudwatchlogs.putSubscriptionFilter(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

}

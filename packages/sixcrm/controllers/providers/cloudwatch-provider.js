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
		return this.cloudwatchlogs.putSubscriptionFilter(parameters).promise();

	}

	getSubscriptionFilters(logGroupName, filterNamePrefix) {
		return this.cloudwatchlogs.describeSubscriptionFilters({
			logGroupName,
			filterNamePrefix
		}).promise();

	}

}

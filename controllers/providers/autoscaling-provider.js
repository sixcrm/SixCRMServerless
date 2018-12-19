const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class AutoscalingProvider extends AWSProvider{

	constructor(){

		super();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.autoscaling = new this.AWS.ApplicationAutoScaling({
			apiVersion: '2016-02-06',
			region: global.SixCRM.configuration.site_config.aws.region
		});

	}

	registerScalableTarget(parameters){

		du.debug('Register Scalable Target');

		return this.autoscaling.registerScalableTarget(parameters).promise();

	}

	putScalingPolicy(parameters){

		du.debug('Put Scaling Policy');

		return this.autoscaling.putScalingPolicy(parameters).promise();

	}

	describeScalableTargets(parameters){

		du.debug('Describe Scalable Targets');

		return this.autoscaling.describeScalableTargets(parameters).promise();

	}

	describeScalingPolicies(parameters){

		du.debug('Describe Scaling Policies');

		return this.autoscaling.describeScalingPolicies(parameters).promise();

	}

}

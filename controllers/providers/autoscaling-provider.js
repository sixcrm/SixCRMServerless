

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
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

		return new Promise((resolve) => {

			this.autoscaling.registerScalableTarget(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	putScalingPolicy(parameters){

		du.debug('Put Scaling Policy');

		return new Promise((resolve) => {

			this.autoscaling.putScalingPolicy(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	describeScalableTargets(parameters){

		du.debug('Describe Scalable Targets');

		return new Promise((resolve) => {

			this.autoscaling.describeScalableTargets(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	describeScalingPolicies(parameters){

		du.debug('Describe Scaling Policies');

		return new Promise((resolve) => {

			this.autoscaling.describeScalingPolicies(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

}

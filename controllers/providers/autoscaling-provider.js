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
		return this.autoscaling.registerScalableTarget(parameters).promise();

	}

	putScalingPolicy(parameters){
		return this.autoscaling.putScalingPolicy(parameters).promise();

	}

	describeScalableTargets(parameters){
		return this.autoscaling.describeScalableTargets(parameters).promise();

	}

	describeScalingPolicies(parameters){
		return this.autoscaling.describeScalingPolicies(parameters).promise();

	}

}

const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js')

module.exports = class EC2Provider extends AWSProvider {

	constructor() {

		super();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.ec2 = new this.AWS.EC2({
			apiVersion: '2016-11-15',
			region: this.getRegion()
		});

		this.max_retry_attempts = 3;
		this.retry_pause = 3000;

	}

	describeVpcEndpoints(parameters){
		return this.ec2.describeVpcEndpoints(parameters).promise();

	}

	createVpcEndpoint(parameters){
		return this.ec2.createVpcEndpoint(parameters).promise();

	}

	waitFor(event_name, parameters){
		return this.ec2.waitFor(event_name, parameters).promise();

	}

	describeVpcs(parameters) {
		return this.ec2.describeVpcs(parameters).promise();

	}

	createDefaultVpc() {
		const params = {};

		return this.ec2.createDefaultVpc(params).promise();

	}

	createVPC(parameters) {
		let params = objectutilities.transcribe(
			{
				CidrBlock: 'CidrBlock',
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				AmazonProvidedIpv6CidrBlock: 'AmazonProvidedIpv6CidrBlock',
				DryRun: 'DryRun',
				InstanceTenancy: 'InstanceTenancy'
			},
			parameters,
			params,
			false
		);

		return this.ec2.createVpc(params).promise();

	}

	describeRoutes(parameters) {
		return this.ec2.describeRoutes(parameters).promise();

	}

	replaceRoute(parameters) {
		let params = objectutilities.transcribe(
			{
				RouteTableId: 'RouteTableId'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				DestinationCidrBlock: 'DestinationCidrBlock',
				DestinationIpv6CidrBlock: 'DestinationIpv6CidrBlock',
				DryRun: 'DryRun',
				EgressOnlyInternetGatewayId: 'EgressOnlyInternetGatewayId',
				GatewayId: 'GatewayId',
				InstanceId: 'InstanceId',
				NatGatewayId: 'NatGatewayId',
				NetworkInterfaceId: 'NetworkInterfaceId',
				VpcPeeringConnectionId: 'VpcPeeringConnectionId'
			},
			parameters,
			params,
			false
		);

		return this.ec2.replaceRoute(params).promise();

	}

	createRoute(parameters) {
		let params = objectutilities.transcribe(
			{
				RouteTableId: 'RouteTableId'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				DestinationCidrBlock: 'DestinationCidrBlock',
				DestinationIpv6CidrBlock: 'DestinationIpv6CidrBlock',
				DryRun: 'DryRun',
				EgressOnlyInternetGatewayId: 'EgressOnlyInternetGatewayId',
				GatewayId: 'GatewayId',
				InstanceId: 'InstanceId',
				NatGatewayId: 'NatGatewayId',
				NetworkInterfaceId: 'NetworkInterfaceId',
				VpcPeeringConnectionId: 'VpcPeeringConnectionId'
			},
			parameters,
			params,
			false
		);

		return this.ec2.createRoute(params).promise();

	}

	attachInternetGateway(parameters) {
		return this.ec2.attachInternetGateway(parameters).promise();

	}

	createInternetGateway() {
		return this.ec2.createInternetGateway({}).promise();

	}

	describeInternetGateways(parameters) {
		return this.ec2.describeInternetGateways(parameters).promise();

	}

	associateRouteTable(parameters) {
		return this.ec2.associateRouteTable(parameters).promise();

	}

	createRouteTable(parameters) {
		return this.ec2.createRouteTable(parameters).promise();

	}

	describeRouteTables(parameters) {
		return this.ec2.describeRouteTables(parameters).promise();

	}

	createNatGateway(parameters) {
		return this.ec2.createNatGateway(parameters).promise();

	}

	describeNatGateways(parameters) {
		return this.ec2.describeNatGateways(parameters).promise();

	}

	allocateAddress() {
		const parameters = {
			Domain: 'vpc'
		};

		return this.ec2.allocateAddress(parameters);

	}

	describeAddresses(parameters) {
		return this.ec2.describeAddresses(parameters).promise();

	}

	createTags(parameters) {
		return this.ec2.createTags(parameters).promise();

	}

	createSubnet(parameters) {
		let params = objectutilities.transcribe(
			{
				CidrBlock: 'CidrBlock',
				VpcId: 'VpcId'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				AvailabilityZone: 'AvailabilityZone',
				DryRun: 'DryRun',
				Ipv6CidrBlock: 'Ipv6CidrBlock'
			},
			parameters,
			params,
			false
		);

		return this.ec2.createSubnet(params).promise();

	}

	describeVPCs(parameters) {
		return this.ec2.describeVpcs(parameters).promise();

	}

	describeSubnets(parameters) {
		return this.ec2.describeSubnets(parameters).promise();

	}

	assureSecurityGroup(parameters) {
		return this.securityGroupExists(parameters).then((result) => {

			if (!_.isNull(result)) {

				du.info('Security group exists (' + parameters.GroupName + ')...');

				return result;

			} else {

				du.info('Creating security group (' + parameters.GroupName + ')...');

				return this.createSecurityGroup(parameters);

			}

		});

	}

	securityGroupExists(security_group_definition) {
		let argumentation = {
			Filters: [{
				Name: "tag:Name",
				Values: [security_group_definition.GroupName]
			}]
		};

		if (_.has(security_group_definition, 'GroupId')) {

			argumentation = {
				GroupIds: [security_group_definition.GroupId]
			};

		}

		return this.describeSecurityGroups(argumentation).then(result => {

			if (_.has(result, 'SecurityGroups') && _.isArray(result.SecurityGroups)) {
				if (arrayutilities.nonEmpty(result.SecurityGroups)) {
					if (result.SecurityGroups.length == 1) {
						return result.SecurityGroups[0];
					}
					throw eu.getError('server', 'More than one result: ', result);
				}
				return null;
			}

			throw eu.getError('server', 'Unexpected result: ', result);

		});

	}

	describeSecurityGroups(parameters) {
		return this.ec2.describeSecurityGroups(parameters).promise();

	}

	createSecurityGroup(parameters) {
		let params = objectutilities.transcribe(
			{
				Description: 'Description',
				GroupName: 'GroupName'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				VpcId: 'VpcId'
			},
			parameters,
			params,
			false
		);

		return this.ec2.createSecurityGroup(params).promise();

	}

	addSecurityGroupIngressRules(parameters) {
		return this.removeExistingIngressRules(parameters)
			.then(() => this.authorizeSecurityGroupIngress(parameters));

	}

	authorizeSecurityGroupIngress(parameters) {
		if (_.has(parameters, 'GroupId') && _.has(parameters, 'GroupName')) {
			delete parameters.GroupName;
		}

		return this.ec2.authorizeSecurityGroupIngress(parameters).promise();

	}

	authorizeSecurityGroupEgress(parameters) {
		if (_.has(parameters, 'GroupName')) {
			delete parameters.GroupName;
		}

		return this.ec2.authorizeSecurityGroupEgress(parameters).promise();

	}

	addSecurityGroupEgressRules(parameters) {
		if (!_.has(parameters, 'GroupId')) {

			if (!_.has(parameters, 'GroupName')) {

				throw eu.getError('server', 'Inappropriate Parameterization');

			}

			return this.determineGroupIDFromName(parameters.GroupName).then((group_id) => {

				parameters.GroupId = group_id;

				return this.addSecurityGroupEgressRules(parameters);

			});

		} else {

			return this.removeExistingEgressRules(parameters).then(() => this.authorizeSecurityGroupEgress(parameters));

		}

	}

	removeExistingIngressRules(parameters) {
		return this.securityGroupExists(parameters)
			.then((result) => {

				if (_.has(result, 'IpPermissions') && _.isArray(result.IpPermissions) && result.IpPermissions.length > 0) {

					let ip_permissions = arrayutilities.map(result.IpPermissions, this.filterRule);

					result.IpPermissions = ip_permissions;

					result = objectutilities.subtractiveFilter(['Description', 'OwnerId', 'IpPermissionsEgress', 'Tags', 'VpcId'], result);

					return this.revokeSecurityGroupIngress(result).then((result) => {

						du.info('Successfully revoked ingress rules');

						return result;

					});

				} else {

					du.info('No ingress rules to revoke...');

					return false;

				}

			});

	}

	filterRule(rule) {
		let clean_rule;

		if (_.includes(['tcp', 'udp'], rule.IpProtocol)) {

			clean_rule = objectutilities.additiveFilter(['IpProtocol', 'IpRanges', 'FromPort', 'ToPort', 'UserIdGroupPairs'], rule);

		} else if (rule.IpProtocol == '-1') {
			clean_rule = objectutilities.additiveFilter(['IpProtocol', 'IpRanges', 'UserIdGroupPairs'], rule);
		}

		if (_.has(clean_rule, 'IpRanges') && clean_rule.IpRanges.length < 1) {
			delete clean_rule.IpRanges;
		}

		if (_.has(clean_rule, 'UserIdGroupPairs') && clean_rule.UserIdGroupPairs.length < 1) {
			delete clean_rule.UserIdGroupPairs;
		}

		return clean_rule;


	}

	removeExistingEgressRules(parameters) {
		return new Promise((resolve) => {

			return this.securityGroupExists(parameters).then((result) => {

				if (_.has(result, 'IpPermissionsEgress') && _.isArray(result.IpPermissionsEgress) && result.IpPermissionsEgress.length > 0) {

					let ip_permissions_egress = arrayutilities.map(result.IpPermissionsEgress, this.filterRule);

					result.IpPermissions = ip_permissions_egress;

					result = objectutilities.subtractiveFilter(['GroupName', 'Description', 'OwnerId', 'IpPermissionsEgress', 'Tags', 'VpcId'], result);

					return this.revokeSecurityGroupEgress(result).then((result) => {

						du.info('Successfully revoked egress rules');

						return resolve(result);

					});

				} else {

					du.info('No egress rules to revoke...');

					return resolve(false);

				}

			});

		});

	}

	revokeSecurityGroupIngress(parameters) {
		if (_.has(parameters, 'GroupId') && _.has(parameters, 'GroupName')) {
			delete parameters.GroupName;
		}

		return this.ec2.revokeSecurityGroupIngress(parameters).promise();

	}

	revokeSecurityGroupEgress(parameters) {
		if (_.has(parameters, 'GroupId') && _.has(parameters, 'GroupName')) {
			delete parameters.GroupName;
		}

		return this.ec2.revokeSecurityGroupEgress(parameters).promise();

	}

	destroySecurityGroup(parameters) {
		return new Promise((resolve, reject) => {

			return this.securityGroupExists(parameters).then((results) => {

				if (results === false) {

					du.info('Security Group does not exist');

					return resolve(false);

				} else {

					let handle = this.ec2.deleteSecurityGroup(parameters);

					handle.on('success', (result) => {
						du.info('Security Group destroyed');
						return resolve(result);
					}).on('error', (error) => {
						return reject(eu.getError('server', error));
					});

					return handle.send();
				}

			});

		});

	}

	describeInstances(params) {
		return this.ec2.describeInstances(params).promise();

	}

	runInstance(params) {
		return this.ec2.runInstances(params).promise();

	}

	associateAddress(parameters) {
		return this.ec2.associateAddress(parameters).promise();

	}

	importKeyPair(parameters) {
		return this.ec2.importKeyPair(parameters).promise();

	}

	describeKeyPairs(parameters) {
		return this.ec2.describeKeyPairs(parameters).promise();

	}

}

const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
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

		du.debug('Describe VPC Endpoints');

		return new Promise((resolve) => {

			this.ec2.describeVpcEndpoints(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	createVpcEndpoint(parameters){

		du.debug('Create VPC Endpoint');

		return new Promise((resolve) => {

			this.ec2.createVpcEndpoint(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	waitFor(event_name, parameters){

		du.debug('Wait For');

		return new Promise((resolve) => {

			this.ec2.waitFor(event_name, parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	describeVpcs(parameters) {

		du.debug('Describe VPCs');

		return new Promise((resolve) => {

			this.ec2.describeVpcs(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	createDefaultVpc() {

		du.debug('Create Default VPC');

		const params = {};

		return new Promise((resolve) => {

			this.ec2.createDefaultVpc(params, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	createVPC(parameters) {

		du.debug('Create VPC');

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

		return new Promise((resolve) => {

			this.ec2.createVpc(params, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	describeRoutes(parameters) {

		du.debug('Describe Routes');

		return new Promise((resolve) => {

			this.ec2.describeRoutes(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	replaceRoute(parameters) {

		du.debug('Replace Route');

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

		return new Promise((resolve) => {

			this.ec2.replaceRoute(params, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	createRoute(parameters) {

		du.debug('Create Route');

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

		return new Promise((resolve) => {

			this.ec2.createRoute(params, (error, data) => {

				resolve(this.tolerantCallback(error, data, false));

			});

		});

	}

	attachInternetGateway(parameters) {

		du.debug('Attach Internet Gateway');

		return new Promise((resolve) => {

			this.ec2.attachInternetGateway(parameters, (error, data) => {

				resolve(this.tolerantCallback(error, data, false));

			});

		});

	}

	createInternetGateway() {

		du.debug('Create Internet Gateway');

		return new Promise((resolve) => {

			this.ec2.createInternetGateway({}, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	describeInternetGateways(parameters) {

		du.debug('Describe Internet Gateways');

		return new Promise((resolve) => {

			this.ec2.describeInternetGateways(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	associateRouteTable(parameters) {

		du.debug('Associate Route Table');

		du.debug(parameters);

		return new Promise((resolve) => {

			this.ec2.associateRouteTable(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	createRouteTable(parameters) {

		du.debug('Create Route Table');

		return new Promise((resolve) => {

			this.ec2.createRouteTable(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	describeRouteTables(parameters) {

		du.debug('Describe Route Tables');

		return new Promise((resolve) => {

			this.ec2.describeRouteTables(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data))

			});

		});

	}

	createNatGateway(parameters) {

		du.debug('Create NAT Gateway');

		return new Promise((resolve) => {

			this.ec2.createNatGateway(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data))

			});

		});

	}

	describeNatGateways(parameters) {

		du.debug('Describe NAT Gateways');

		return new Promise((resolve) => {

			this.ec2.describeNatGateways(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data))

			});

		});

	}

	allocateAddress() {

		du.debug('Allocate Address');

		const parameters = {
			Domain: 'vpc'
		};

		return new Promise((resolve) => {

			this.ec2.allocateAddress(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data))

			});

		});

	}

	describeAddresses(parameters) {

		du.debug('Describe Addresses');

		return new Promise((resolve) => {

			this.ec2.describeAddresses(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data))

			});

		});

	}

	createTags(parameters) {

		du.debug('Create Tags');

		return new Promise((resolve) => {

			this.ec2.createTags(parameters, (error, data) => {

				resolve(this.tolerantCallback(error, data, false))

			});

		});

	}

	createSubnet(parameters) {

		du.debug('Create Subnet');

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

		return new Promise((resolve) => {

			this.ec2.createSubnet(params, (error, data) => {

				resolve(this.AWSCallback(error, data))

			});

		});

	}

	describeVPCs(parameters) {

		du.debug('Describe VPCs');

		return new Promise((resolve) => {

			this.ec2.describeVpcs(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data))

			});

		});

	}

	describeSubnets(parameters) {

		du.debug('Describe Subnets');

		return new Promise((resolve) => {

			this.ec2.describeSubnets(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data))

			});

		});

	}

	assureSecurityGroup(parameters) {

		du.debug('Assure Security Group');

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

		du.debug('Security Group Exists');

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

		du.debug('Describe Security Groups');

		return new Promise((resolve) => {

			this.ec2.describeSecurityGroups(parameters, (error, data) => {

				resolve(this.tolerantCallback(error, data, false));

			});

		});

	}

	createSecurityGroup(parameters) {

		du.debug('Create Security Group');

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

		return new Promise((resolve) => {

			this.ec2.createSecurityGroup(params, (error, data) => {

				resolve(this.tolerantCallback(error, data, false));

			});

		});

	}

	addSecurityGroupIngressRules(parameters) {

		du.debug('Add Security Group Ingress Rules');

		return this.removeExistingIngressRules(parameters)
			.then(() => this.authorizeSecurityGroupIngress(parameters));

	}

	authorizeSecurityGroupIngress(parameters) {

		du.debug('Authorize Security Group Ingress');

		if (_.has(parameters, 'GroupId') && _.has(parameters, 'GroupName')) {
			delete parameters.GroupName;
		}

		return new Promise((resolve) => {

			this.ec2.authorizeSecurityGroupIngress(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data))

			});

		});

	}

	/*
	resolveIpPermissionsGroupNameReferences(parameters){

		du.debug('Resolve IP Permissions Group Name References');

		let ip_permission_promises = arrayutilities.map(parameters.IpPermissions, ip_permission => {

			if(_.has(ip_permission, 'UserIdGroupPairs')){

				let translation_promises = arrayutilities.map(ip_permission.UserIdGroupPairs, user_id_group_pair => {

					if(!_.has(user_id_group_pair, 'GroupName')){
						return Promise.resolve(user_id_group_pair);
					}

					return this.securityGroupExists(user_id_group_pair).then(result => {
						if(_.isNull(result)){
							eu.getError('Unable to identify security group: "'+user_id_group_pair.GroupName+'"');
						}
						user_id_group_pair.GroupId = result.GroupId;
						delete user_id_group_pair.GroupName;
						return user_id_group_pair;
					});

				});

				du.debug(translation_promises);

				return Promise.all(translation_promises).then(translation_promises => {
					du.info(translation_promises);
					return translation_promises;
				});

			}

			return ip_permission;

		});

		return Promise.all(ip_permission_promises).then(ip_permsission_promises => {
			du.info(ip_permission_promises);
			parameters.IpPermissions = ip_permission_promises;
			return parameters;
		});

	}
	*/

	authorizeSecurityGroupEgress(parameters) {

		du.debug('Authorize Security Group Egress');

		if (_.has(parameters, 'GroupName')) {
			delete parameters.GroupName;
		}

		return new Promise((resolve) => {

			this.ec2.authorizeSecurityGroupEgress(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data))

			});

		});

	}

	addSecurityGroupEgressRules(parameters) {

		du.debug('Add Security Group Egress Rules');

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

		du.debug('Remove Existing Ingress Rules');

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

		du.debug('Filter Rule');

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

		du.debug('Remove Existing Egress Rules');

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

		du.debug('Revoke Security Group Ingress');

		if (_.has(parameters, 'GroupId') && _.has(parameters, 'GroupName')) {
			delete parameters.GroupName;
		}

		return new Promise((resolve) => {

			this.ec2.revokeSecurityGroupIngress(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	revokeSecurityGroupEgress(parameters) {

		du.debug('Revoke Security Group Egress');

		if (_.has(parameters, 'GroupId') && _.has(parameters, 'GroupName')) {
			delete parameters.GroupName;
		}

		return new Promise((resolve) => {

			this.ec2.revokeSecurityGroupEgress(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	destroySecurityGroup(parameters) {

		du.debug('Create Security Group');

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

		du.debug('Describe EC2 instances');

		return new Promise((resolve) => {

			this.ec2.describeInstances(params, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	runInstance(params) {

		du.debug('Create EC2 Instance');

		return new Promise((resolve) => {

			this.ec2.runInstances(params, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	associateAddress(parameters) {

		du.debug('Associate EIP to EC2 Instance');

		return new Promise((resolve) => {

			this.ec2.associateAddress(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	importKeyPair(parameters) {

		du.debug('Create keypair');

		return new Promise((resolve) => {

			this.ec2.importKeyPair(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	describeKeyPairs(parameters) {

		du.debug('Create keypair');

		return new Promise((resolve) => {

			this.ec2.describeKeyPairs(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

}

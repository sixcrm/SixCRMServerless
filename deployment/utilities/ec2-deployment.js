const _ = require('lodash');
const path = require('path');
const BBPromise = require('bluebird');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;
const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class EC2Deployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.ec2provider = new EC2Provider();

	}

	deployEndpoints() {
		const endpoints = this.getConfigurationJSON('endpoints');

		let endpoint_promises = arrayutilities.map(endpoints, (endpoint_definition) => {

			return () => this.deployEndpoint(endpoint_definition);

		});

		return arrayutilities.serial(endpoint_promises).then(() => {
			return 'Complete';
		});

	}

	deployEndpoint(endpoint_definition) {
		return this.endpointExists(endpoint_definition).then(endpoint => {
			if (_.isNull(endpoint)) {
				du.info('Creating endpoint: ', endpoint_definition);
				return this.createEndpoint(endpoint_definition);
			}
			du.info('Endpoint exists: ', endpoint_definition);
			//Technical Debt:  Write a update method
			return true;
		});

	}

	endpointExists(endpoint_definition) {
		return this.setVPC(endpoint_definition.VpcName)
			.then(() => {

				let service_name = parserutilities.parse(endpoint_definition.ServiceName, {
					aws_account_region: global.SixCRM.configuration.site_config.aws.region
				});

				let argumentation = {
					Filters: [{
						Name: 'service-name',
						Values: [service_name]
					},
					{
						Name: 'vpc-id',
						Values: [this.vpc.VpcId]
					}
					]
				};

				return this.ec2provider.describeVpcEndpoints(argumentation).then(results => {

					if (_.has(results, 'VpcEndpoints') && _.isArray(results.VpcEndpoints)) {
						if (arrayutilities.nonEmpty(results.VpcEndpoints)) {
							if (results.VpcEndpoints.length == 1) {
								return results.VpcEndpoints[0];
							}
							throw eu.getError('server', 'Multiple Endpoints returned:', results);
						}
						return null;
					}

					throw eu.getError('server', 'Unexpected response: ', results);

				});

			});

	}

	createEndpoint(endpoint_definition) {
		return this.setVPC(endpoint_definition.VpcName)
			.then(() => {
				endpoint_definition.VpcId = this.vpc.VpcId;
				return true;
			})
			.then(() => {

				let route_table_promises = arrayutilities.map(endpoint_definition.RouteTableNames, route_table_name => {
					return this.routeTableExists({
						Name: route_table_name
					});
				});

				return Promise.all(route_table_promises).then(route_tables => {

					let route_table_ids = arrayutilities.map(route_tables, route_table => {
						if (_.has(route_table, 'RouteTableId')) {
							return route_table.RouteTableId;
						}
						throw eu.getError('server', 'Missing route table...');
					});

					endpoint_definition.RouteTableIds = route_table_ids;
					return true;

				});

			}).then(() => {

				endpoint_definition.ServiceName = parserutilities.parse(endpoint_definition.ServiceName, {
					aws_account_region: global.SixCRM.configuration.site_config.aws.region
				});

				return true;

			}).then(() => {

				let parameters = objectutilities.transcribe({
					ServiceName: "ServiceName",
					VpcId: "VpcId",
					VpcEndpointType: "VpcEndpointType"
				},
				endpoint_definition, {},
				true
				);

				parameters = objectutilities.transcribe({
					ClientToken: "ClientToken",
					PolicyDocument: "PolicyDocument",
					PrivateDnsEnabled: "PrivateDnsEnabled",
					RouteTableIds: "RouteTableIds",
					SecurityGroupIds: "SecurityGroupIds",
					SubnetIds: "SubnetIds"
				},
				endpoint_definition,
				parameters,
				false
				);

				if (_.has(parameters, 'PolicyDocument') && !_.isString(parameters.PolicyDocument)) {
					parameters.PolicyDocument = JSON.stringify(parameters.PolicyDocument);
				}

				return this.ec2provider.createVpcEndpoint(parameters);

			});

	}

	deployVPCs() {
		const vpcs = this.getConfigurationJSON('vpcs');

		let vpc_promises = arrayutilities.map(vpcs, (vpc_definition) => {

			return () => this.deployVPC(vpc_definition);

		});

		return arrayutilities.serial(vpc_promises).then(() => {
			return 'Complete';
		});

	}

	deployVPC(vpc_definition) {
		//Technical Debt:  If default changes, need to account for that here...
		//Note:  There are lots of things that get associated with VPCs that aren't accounted for here...
		//NetworkACLs
		//DHCP Options
		//Route Tables

		return this.VPCExists(vpc_definition).then(result => {
			if (_.isNull(result)) {
				du.info('VPC does not exist: ' + vpc_definition.Name);
				return this.createVPC(vpc_definition);
			}

			du.info('VPC exists: ' + vpc_definition.Name);
			return true;

		})

	}

	createVPC(vpc_definition) {
		return Promise.resolve()
			.then(() => {

				if (_.has(vpc_definition, 'Default') && vpc_definition.Default === true) {
					return this.ec2provider.createDefaultVpc();
				}

				return this.ec2provider.createVPC(vpc_definition);

			}).then(result => {

				return this.nameEC2Resource(result.Vpc.VpcId, vpc_definition.Name).then(() => {
					du.info('VPC Created: ' + vpc_definition.Name);
					return result;
				});

			});

	}

	VPCExists(vpc_definition) {
		const argumentation = {
			Filters: [{
				Name: 'tag:Name',
				Values: [vpc_definition.Name]
			}]
		};

		return this.ec2provider.describeVpcs(argumentation).then(result => {

			if (_.has(result, 'Vpcs') && _.isArray(result.Vpcs)) {
				if (arrayutilities.nonEmpty(result.Vpcs)) {
					if (result.Vpcs.length == 1) {
						return result.Vpcs[0];
					}
					throw eu.getError('server', 'Multiple results returned: ', result);
				}
				return null;
			}

			throw eu.getError('server', 'Unexpected result', result);

		});

	}

	deployInternetGateways() {
		const internet_gateways = this.getConfigurationJSON('internet_gateways');

		let ig_promises = arrayutilities.map(internet_gateways, (ig) => {

			return () => this.deployInternetGateway(ig);

		});

		return arrayutilities.serial(ig_promises).then(() => {
			return 'Complete';
		});

	}

	deployInternetGateway(ig_definition) {
		return this.gatewayExists(ig_definition).then(result => {

			if (_.isNull(result)) {
				du.info('Internet Gateway does not exist: ' + ig_definition.Name);
				return this.createInternetGateway(ig_definition);
			}

			du.info('Internet Gateway exists: ' + ig_definition.Name);
			return result;

		}).then((internet_gateway) => {

			return this.setVPC('sixcrm').then(() => {
				return this.attachInternetGateway(internet_gateway).catch(error => {
					if (error.code == 'Resource.AlreadyAssociated') {
						du.info('Internet Gateway already associated');
						return true;
					}
					throw error;
				})
			});

		});

	}

	attachInternetGateway(internet_gateway) {
		let argumentation = {
			InternetGatewayId: internet_gateway.InternetGatewayId,
			VpcId: this.vpc.VpcId
		};

		return this.ec2provider.attachInternetGateway(argumentation);

	}

	createInternetGateway(ig_definition) {
		return this.ec2provider.createInternetGateway().then(result => {
			return this.nameEC2Resource(result.InternetGateway.InternetGatewayId, ig_definition.Name).then(() => {
				du.info('Internet Gateway Created: ' + ig_definition.Name);
				return result.InternetGateway;
			});
		});

	}

	gatewayExists(ig_definition) {
		const argumentation = {
			Filters: [{
				Name: 'tag:Name',
				Values: [ig_definition.Name]
			}]
		};

		return this.ec2provider.describeInternetGateways(argumentation).then(result => {
			if (_.has(result, 'InternetGateways') && _.isArray(result.InternetGateways)) {
				if (arrayutilities.nonEmpty(result.InternetGateways)) {
					if (result.InternetGateways.length == 1) {
						return result.InternetGateways[0];
					}
					throw eu.getError('server', 'More than one result returned: ', result);
				}
				return null;
			}
			throw eu.getError('server', 'Unexpected results: ', result);
		});

	}

	deployRouteTables() {
		const route_tables = this.getConfigurationJSON('route_tables');

		return this.setVPC('sixcrm').then(() => {

			let route_table_promises = arrayutilities.map(route_tables, (route_table) => {

				return () => this.deployRouteTable(route_table);

			});

			return arrayutilities.serial(route_table_promises).then(() => {
				return 'Complete';
			});

		});

	}

	deployRouteTable(route_table_definition) {
		return this.routeTableExists(route_table_definition).then((result) => {

			if (_.isNull(result)) {
				du.info('Route Table does not exist: ' + route_table_definition.Name);
				return this.createRouteTable(route_table_definition);
			}

			du.info('Route Table exists: ' + route_table_definition.Name);
			return result;

		}).then(route_table => {

			if (_.has(route_table_definition, 'AssociatedSubnets')) {

				let subnet_promises = arrayutilities.map(route_table_definition.AssociatedSubnets, (subnet_association) => {
					return this.subnetExists(subnet_association);
				});

				return Promise.all(subnet_promises).then(subnets => {

					let subnet_associations = arrayutilities.map(subnets, subnet => {

						if (_.has(subnet, 'SubnetId')) {

							let argumentation = {
								RouteTableId: route_table.RouteTableId,
								SubnetId: subnet.SubnetId
							};

							return () => this.ec2provider.associateRouteTable(argumentation);

						}

						du.warning('Unknown subnet structure: ', subnet);

						return () => Promise.resolve(null);

					});

					return arrayutilities.serial(subnet_associations);

				}).then(() => {
					return route_table;
				});

			}

			return route_table;

		}).then(route_table => {

			if (_.has(route_table_definition, 'Routes') && _.isArray(route_table_definition.Routes)) {

				let route_promises = arrayutilities.map(route_table_definition.Routes, route_definition => {
					return () => this.deployRoute(route_table, route_definition);
				});

				return arrayutilities.serial(route_promises);

			}

			return;

		}).then(() => {

			du.info('Route table deployed: ' + route_table_definition.Name);
			return true;

		});

	}

	deployRoute(route_table, route_definition) {
		//Technical Debt:  Need to enable other named properties to be hydrated here...
		let associated_id_promises = [];

		if (_.has(route_definition, 'NatGatewayName')) {
			associated_id_promises.push(this.NATExists({
				Name: route_definition.NatGatewayName
			}));
		}

		if (_.has(route_definition, 'GatewayName')) {
			associated_id_promises.push(this.gatewayExists({
				Name: route_definition.GatewayName
			}));
		}

		return Promise.all(associated_id_promises).then(([associated_id]) => {

			let additional_argumentation = {
				RouteTableId: route_table.RouteTableId,
			};

			if (_.has(associated_id, 'NatGatewayId')) {

				additional_argumentation.NatGatewayId = associated_id.NatGatewayId;

			} else if (_.has(associated_id, 'InternetGatewayId')) {

				additional_argumentation.GatewayId = associated_id.InternetGatewayId;

			} else {

				throw eu.getError('server', 'Unrecognized response: ', associated_id);

			}

			const argumentation = objectutilities.merge(route_definition, additional_argumentation);

			return this.ec2provider.createRoute(argumentation).then(() => {
				du.info('Route created.');
				return true;
			}).catch((error) => {
				if (error.code == 'RouteAlreadyExists') {
					return this.ec2provider.replaceRoute(argumentation).then(() => {
						du.info('Route replaced.');
						return true;
					})
				}
				throw error;
			})

		});
	}

	createRouteTable(route_table_definition) {
		let argumentation = {
			VpcId: this.vpc.VpcId
		};

		return this.ec2provider.createRouteTable(argumentation).then(result => {

			if (!objectutilities.hasRecursive(result, 'RouteTable.RouteTableId')) {
				throw eu.getError('server', 'Unexpected result: ', result);
			}

			return this.nameEC2Resource(result.RouteTable.RouteTableId, route_table_definition.Name).then(() => {
				return result.RouteTable;
			});

		});

	}

	routeTableExists(route_table_definition) {
		const argumentation = {
			Filters: [{
				Name: 'tag:Name',
				Values: [route_table_definition.Name]
			}]
		};

		return this.ec2provider.describeRouteTables(argumentation).then(result => {

			if (_.has(result, 'RouteTables') && _.isArray(result.RouteTables)) {

				if (arrayutilities.nonEmpty(result.RouteTables)) {

					if (result.RouteTables.length == 1) {
						return result.RouteTables[0];
					}

					throw eu.getError('server', 'More than one result returned: ', result);

				}

				return null;

			}

			throw eu.getError('server', 'Unexpected result: ', result);

		});

	}

	deployNATs() {
		const nats = this.getConfigurationJSON('nats');

		let nat_promises = arrayutilities.map(nats, (nat) => {

			return () => this.deployNAT(nat);

		});

		return arrayutilities.serial(nat_promises).then(() => {
			return 'Complete';
		});

	}

	deployNAT(nat_definition) {
		return this.NATExists(nat_definition).then(result => {
			if (_.isNull(result)) {
				du.info('NAT does not exist: ' + nat_definition.Name);
				return this.createNAT(nat_definition);
			}

			du.info('NAT exists: ' + nat_definition.Name);
			return true;

		});

	}

	createNAT(nat_definition) {
		let associated_properties_promises = [
			this.EIPExists({
				Name: nat_definition.AllocationName
			}),
			this.subnetExists({
				Name: nat_definition.SubnetName
			})
		];

		return Promise.all(associated_properties_promises).then(([eip, subnet]) => {

			if (_.isNull(eip)) {
				throw eu.getError('server', 'EIP does not exist: ' + nat_definition.AllocationName);
			}

			if (_.isNull(subnet)) {
				throw eu.getError('server', 'Subnet does not exist: ' + nat_definition.SubnetName);
			}

			let argumentation = {
				AllocationId: eip.AllocationId,
				SubnetId: subnet.SubnetId
			};

			return this.ec2provider.createNatGateway(argumentation).then(result => {

				if (!objectutilities.hasRecursive(result, 'NatGateway.NatGatewayId')) {
					throw eu.getError('server', 'Unexpected result: ', result);
				}

				return this.nameEC2Resource(result.NatGateway.NatGatewayId, nat_definition.Name);

			});

		}).then(() => {

			const argumentation = {
				Filter: [{
					Name: 'tag:Name',
					Values: [nat_definition.Name]
				}]
			};

			return this.ec2provider.waitFor('natGatewayAvailable', argumentation);

		});

	}

	NATExists(nat_definition) {
		let argumentation = {
			Filter: [{
				Name: "tag:Name",
				Values: [
					nat_definition.Name
				]
			}]
		}

		return this.ec2provider.describeNatGateways(argumentation).then(result => {

			if (_.has(result, 'NatGateways') && _.isArray(result.NatGateways)) {

				if (arrayutilities.nonEmpty(result.NatGateways)) {
					if (result.NatGateways.length == 1) {
						return result.NatGateways[0];
					}

					throw eu.getError('server', 'More than one NAT Gateway returned: ', result);

				}

				return null;

			}

			throw eu.getError('server', 'Unexpected results: ', result);

		});

	}

	deployEIPs() {
		const eips = this.getConfigurationJSON('eips');

		let eip_promises = arrayutilities.map(eips, (eip) => {

			return () => this.deployEIP(eip);

		});

		return arrayutilities.serial(eip_promises).then(() => {
			return 'Complete';
		});

	}

	deployEIP(eip_definition) {
		return this.EIPExists(eip_definition).then(result => {

			if (_.isNull(result)) {
				du.info('EIP does not exist: ' + eip_definition.Name);
				return this.createEIP(eip_definition).then(() => {
					return du.info('EIP Allocated.');
				});
			}

			du.info('EIP exists');
			return true;

		});

	}

	createEIP(eip_definition) {
		let parameters = objectutilities.transcribe({
			"Domain": "Domain"
		},
		eip_definition, {},
		true
		);

		return this.ec2provider.allocateAddress(parameters).then((result) => {

			if (objectutilities.hasRecursive(result, 'AllocationId')) {
				return this.nameEC2Resource(result.AllocationId, eip_definition.Name);
			}

			throw eu.getError('server', 'Unexpected Response: ', result);

		});

	}

	EIPExists(eip_definition) {
		let argumentation = {
			Filters: [{
				Name: "domain",
				Values: ["vpc"]
			},
			{
				Name: 'tag:Name',
				Values: [eip_definition.Name]
			}
			]
		};

		return this.ec2provider.describeAddresses(argumentation).then(result => {

			if (_.has(result, 'Addresses') && _.isArray(result.Addresses)) {

				if (arrayutilities.nonEmpty(result.Addresses)) {

					if (result.Addresses.length == 1) {
						return result.Addresses[0];
					}

					throw eu.getError('server', 'More than one address was returned: ', result.Addresses);

				}

				return null;

			}

			throw eu.getError('server', 'Unexpected results:', result);

		});

	}

	deploySubnets() {
		const subnets = this.getConfigurationJSON('subnets');

		return this.setVPC('sixcrm').then(() => {

			let subnet_promises = arrayutilities.map(subnets, (subnet) => {

				return () => this.deploySubnet(subnet);

			});

			return arrayutilities.serial(subnet_promises).then(() => {
				return 'Complete';
			});

		});

	}

	setVPC(vpc_name = null) {
		let argumentation = {
			Filters: [{
				Name: 'isDefault',
				Values: ['true']
			}]
		};

		if (!_.isNull(vpc_name)) {

			argumentation = {
				Filters: [{
					Name: 'tag:Name',
					Values: [vpc_name]
				}]
			};

		}

		return this.ec2provider.describeVPCs(argumentation).then(result => {

			if (_.has(result, 'Vpcs') && _.isArray(result.Vpcs)) {

				if (arrayutilities.nonEmpty(result.Vpcs)) {

					if (result.Vpcs.length == 1) {
						this.vpc = result.Vpcs[0];
						return this.vpc;
					}

					throw eu.getError('server', 'More than one VPC returned: ' + result.Vpcs);

				}

				throw eu.getError('server', 'Unable to identify VPC');

			}

			throw eu.getError('server', 'Unable to describe VPCs: ', result);

		});

	}

	deploySubnet(subnet_definition) {
		return this.subnetExists(subnet_definition).then(subnet => {

			if (_.isNull(subnet)) {
				du.info('Subnet does not exist: ' + subnet_definition.Name);
				return this.createSubnet(subnet_definition);
			}

			du.info('Subnet exists: ' + subnet_definition.Name);

			return this.updateSubnet(subnet, subnet_definition);

		});

	}

	subnetExists(subnet_definition) {
		let argumentation = {
			Filters: [{
				Name: 'tag:Name',
				Values: [subnet_definition.Name]
			}]
		};

		return this.ec2provider.describeSubnets(argumentation).then(result => {

			if (_.has(result, 'Subnets') && _.isArray(result.Subnets)) {

				if (arrayutilities.nonEmpty(result.Subnets)) {

					if (result.Subnets.length == 1) {
						return result.Subnets[0];
					}

					throw eu.getError('Multiple subnets returned:', result);

				}

				return null;

			}

			throw eu.getError('server', 'Unexpected response: ', result);

		});

	}

	createSubnet(subnet_definition) {
		let vpc_cidr_array = this.vpc.CidrBlock.split('.');
		subnet_definition.CidrBlock = parserutilities.parse(subnet_definition.CidrBlock, {
			'vpc.cidr.1': vpc_cidr_array[0],
			'vpc.cidr.2': vpc_cidr_array[1],
		});

		subnet_definition.VpcId = this.vpc.VpcId;

		return this.ec2provider.createSubnet(subnet_definition).then((result) => {

			if (objectutilities.hasRecursive(result, 'Subnet.SubnetId')) {
				return this.nameEC2Resource(result.Subnet.SubnetId, subnet_definition.Name);
			}

			throw eu.getError('server', 'Unexpected Response: ', result);

		});

	}

	nameEC2Resource(resource_identifier, name, count = 0) {
		let argumentation = {
			Resources: [
				resource_identifier
			],
			Tags: [{
				Key: 'Name',
				Value: name
			}]
		};

		du.info(argumentation);

		return this.ec2provider.createTags(argumentation).then(() => {
			return true;
		}).catch(error => {
			if (error.code.includes('NotFound')) {
				if (count < 10) {
					return timestamp.delay(8000)().then(() => {
						count = count + 1;
						return this.nameEC2Resource(resource_identifier, name, count);
					});
				}
			}
			throw error;
		});

	}

	updateSubnet(subnet, subnet_definition) {
		du.info('This feature is currently not supported.');

		du.info(subnet, subnet_definition);

		return true;

	}

	deploySecurityGroups() {
		let security_groups = this.getConfigurationJSON('security_groups');

		return this.setVPC('sixcrm').then(() => {

			let security_group_promises = arrayutilities.map(security_groups, (security_group) => {

				return () => this.deploySecurityGroup(security_group);

			});

			return arrayutilities.serial(security_group_promises).then(() => {
				return 'Complete';
			});

		});

	}

	securityGroupExists(parameters) {
		return this.ec2provider.securityGroupExists(parameters);

	}

	deploySecurityGroup(security_group_definition) {
		security_group_definition.VpcId = this.vpc.VpcId;

		du.info(security_group_definition);

		return this.ec2provider.securityGroupExists(security_group_definition).then((result) => {

			if (_.isNull(result)) {

				return this.ec2provider.createSecurityGroup(security_group_definition).then(result => {

					if (!objectutilities.hasRecursive(result, 'GroupId')) {
						throw eu.getError('server', 'Unexpected result: ', result);
					}

					return this.nameEC2Resource(result.GroupId, security_group_definition.GroupName).then(() => {
						return result;
					});

				});

			}

			return result;

		}).then((result) => {

			security_group_definition.GroupId = result.GroupId;
			let ingress_parameter_group = this.createIngressParameterGroup(security_group_definition);

			if (!_.isNull(ingress_parameter_group)) {
				return this.ec2provider.addSecurityGroupIngressRules(ingress_parameter_group).then(() => {
					du.info('Successfully created ingress rules.');
					return result;
				})
			} else {
				return result;
			}

		}).then((result) => {

			security_group_definition.GroupId = result.GroupId;
			let egress_parameter_group = this.createEgressParameterGroup(security_group_definition);

			if (!_.isNull(egress_parameter_group)) {
				return this.ec2provider.addSecurityGroupEgressRules(egress_parameter_group).then(() => {
					du.info('Successfully created egress rules.');
					return result;
				})
			} else {
				return result;
			}

		}).then(() => {
			du.info('Security group deployed')
			return true;
		});

	}

	createIngressParameterGroup(security_group_definition) {
		if (_.has(security_group_definition, 'Ingress')) {

			let ingress = security_group_definition.Ingress;

			let copy = objectutilities.clone(security_group_definition);

			delete copy.Egress;

			delete copy.Ingress;

			copy = objectutilities.merge(copy, ingress);

			return this.createParameterGroup('security_group', 'create_ingress_rules', copy);

		}

		return null;


	}

	createEgressParameterGroup(security_group_definition) {
		if (_.has(security_group_definition, 'Egress')) {

			let egress = security_group_definition.Egress;

			let copy = objectutilities.clone(security_group_definition);

			delete copy.Egress;

			delete copy.Ingress;

			copy = objectutilities.merge(copy, egress);

			return this.createParameterGroup('security_group', 'create_egress_rules', copy);

		} else {

			return null;

		}

	}

	destroySecurityGroups() {
		let security_groups = this.getConfigurationJSON('security_groups');

		let security_group_promises = arrayutilities.map(security_groups, (security_group) => this.destroySecurityGroup(security_group));

		return Promise.all(security_group_promises).then(() => {

			return 'Complete';

		});

	}

	destroySecurityGroup(security_group_definition) {
		let parameters = this.createDestroyParameterGroup(security_group_definition);

		return this.ec2provider.destroySecurityGroup(parameters);

	}

	createDestroyParameterGroup(security_group_definition) {
		return this.createParameterGroup('security_group', 'delete', security_group_definition);

	}

	getConfigurationJSON(filename) {
		//Technical Debt:  This needs to be expanded to support multiple definitions...
		return global.SixCRM.routes.include('deployment', 'ec2/configuration/' + filename + '.json');

	}

	async resolveInstance(name) {

		const results = await this.ec2provider.describeInstances();

		const found = results.Reservations.find((r) => {

			return r.Instances.find((i) => {

				return i.Tags.find((t) => t.Value === name);

			});

		});

		return found;

	}

	async deployEC2Instances() {

		const self = this;

		const serverTemplates = require(path.join(__dirname, '../', 'ec2', 'configuration', 'servers.json'));
		return BBPromise.each(serverTemplates, async (serverTemplate) => {

			if (await this.resolveInstance(serverTemplate.TagSpecifications[0].Tags[0].Value)) {
				return;

			}

			const keyPair = require(path.join(__dirname, '../../config', global.SixCRM.configuration.stage, 'ssh-keys', 'sixcrm.json'))
			const keyPairs = await this.ec2provider.describeKeyPairs();

			if (!keyPairs.KeyPairs.find((k) => {

				return k.KeyName === keyPair.KeyName;

			})) {
				await this.ec2provider.importKeyPair(keyPair);

			}

			du.debug('EC2 Instance deploy');

			const securityGroups = await _getSecurityGroupIds(serverTemplate.SecurityGroupIds);
			serverTemplate.SecurityGroupIds = securityGroups;

			const subnet = await this.subnetExists({
				Name: serverTemplate.SubnetId
			});

			serverTemplate.SubnetId = subnet.SubnetId;

			const es2Result = await this.ec2provider.runInstance(_.omit(serverTemplate, ['EIP']));

			if (serverTemplate.EIP) {

				await this.ec2provider.waitFor('instanceRunning', {
					Filters: [{
						Name: 'instance-id',
						Values: [es2Result.Instances[0].InstanceId]
					}]
				});

				await BBPromise.delay(5000);

				const eip = await this.EIPExists({
					Name: serverTemplate.EIP
				});

				return this.ec2provider.associateAddress({
					AllocationId: eip.AllocationId,
					InstanceId: es2Result.Instances[0].InstanceId
				});

			}

		});

		async function _getSecurityGroupIds(groupNames) {

			return BBPromise.map(groupNames, async (groupName) => {

				const securityGroup = await self.ec2provider.securityGroupExists({
					GroupName: groupName
				});

				return securityGroup.GroupId;

			});

		}

	}

}

const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const fileutilities = require('@sixcrm/sixcrmcore/util/file-utilities').default;
const parserutilities = require('@sixcrm/sixcrmcore/util/parser-utilities').default;
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const DMSProvider = global.SixCRM.routes.include('controllers', 'providers/dms-provider.js');
const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');

module.exports = class IAMDeployment extends AWSDeploymentUtilities {

	constructor() {
		super();

		this.dms = new DMSProvider();
		this.ec2 = new EC2Provider();

		this.variables = {
			account: global.SixCRM.configuration.site_config.aws.account,
			stage: global.SixCRM.configuration.stage,
			bin_csv_schema: JSON.stringify(global.SixCRM.routes.include('deployment', 'dms/configuration/bin-csv-schema.json')),
			bin_table_mappings: JSON.stringify(global.SixCRM.routes.include('deployment', 'dms/configuration/bin-table-mappings.json')),
			import_bins_settings: JSON.stringify(global.SixCRM.routes.include('deployment', 'dms/configuration/import-bins-settings.json'))
		};
	}

	deploy() {
		return this.deploySubnets()
			.then(() => this.deployInstances())
			.then(() => this.deployEndpoints())
			.then(() => this.deployTasks())
			.then(() => 'Complete');
	}

	getDefinitions(directory) {
		return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', `dms/${directory}`))
			.then(filenames => {
				const include_promises = arrayutilities.map(filenames, filename => {
					return global.SixCRM.routes.include('deployment', `dms/${directory}/${filename}`);
				});
				return Promise.all(include_promises);
			});
	}

	deploySubnets() {
		du.debug('Deploy Subnets');

		return this.ec2.describeRouteTables({
			Filters: [{
				Name: 'tag:Name',
				Values: ['sixcrm-private-subnets']
			}]
		})
			.then(result => arrayutilities.map(result.RouteTables[0].Associations, association => association.SubnetId))
			.then(subnets => {
				return this.getDefinitions('subnets')
					.then(definitions => Promise.all(
						arrayutilities.map(definitions, definition => {
							return this.dms.replicationSubnetGroupExists(definition.ReplicationSubnetGroupIdentifier)
								.then(exists => {
									if (!exists) {
										definition.SubnetIds = subnets;
										return this.dms.createReplicationSubnetGroup(this.parseDefinition(definition));
									}

									return;
								});
						})
					));
			});
	}

	deployInstances() {
		du.debug('Deploy Instances');

		return this.ec2.describeVpcs({
			Filters: [{
				Name: 'tag:Name',
				Values: ['sixcrm']
			}]
		})
			.then(response => {
				const vpcId = response.Vpcs[0].VpcId;
				return this.ec2.describeSecurityGroups({
					Filters: [{
						Name: 'group-name',
						Values: ['default']
					},{
						Name: 'vpc-id',
						Values: [vpcId]
					}]
				})
			})
			.then(response => {
				this.variables.vpc_security_group = response.SecurityGroups[0].GroupId;
				return;
			})
			.then(() => this.getDefinitions('instances'))
			.then(definitions => Promise.all(
				arrayutilities.map(definitions, definition => {
					return this.dms.replicationInstanceExists(definition.ReplicationInstanceIdentifier)
						.then(exists => {
							if (!exists) {
								return this.dms.createReplicationInstance(this.parseDefinition(definition));
							}

							return;
						})
						.then(() => this.waitForInstance(definition.ReplicationInstanceIdentifier));
				})
			));
	}

	deployEndpoints() {
		du.debug('Deploy Endpoints');

		return this.getDefinitions('endpoints')
			.then(definitions => Promise.all(
				arrayutilities.map(definitions, definition => {
					return this.dms.endpointExists(definition.EndpointIdentifier)
						.then(exists => {
							if (!exists) {
								return this.dms.createEndpoint(this.parseDefinition(definition));
							}

							return;
						})
				})
			));
	}

	deployTasks() {
		du.debug('Deploy Tasks');

		const instance = this.dms.describeReplicationInstances({
			Filters: [{
				Name: "replication-instance-id",
				Values: ["sixcrm-replication-server"]
			}]
		})
			.then(response => {
				const instance = response.ReplicationInstances[0];
				const key = instance.ReplicationInstanceIdentifier.replace(/-/g, '_');
				this.variables[key] = instance.ReplicationInstanceArn;
				return;
			});

		const endpoints = this.dms.describeEndpoints({
			Filters: [{
				Name: "endpoint-id",
				Values: ["sixcrm-s3-bins", "sixcrm-dynamodb"]
			}]
		})
			.then(response => {
				arrayutilities.map(response.Endpoints, endpoint => {
					const key = endpoint.EndpointIdentifier.replace(/-/g, '_');
					this.variables[key] = endpoint.EndpointArn;
				});
				return;
			});

		return Promise.all([
			this.getDefinitions('tasks'),
			instance,
			endpoints
		])
			.then(([definitions]) => Promise.all(
				arrayutilities.map(definitions, definition => {
					return this.dms.replicationTaskExists(definition.ReplicationTaskIdentifier)
						.then(exists => {
							if (!exists) {
								return this.dms.createReplicationTask(this.parseDefinition(definition));
							}

							return;
						})
						.then(() => this.waitForTask(definition.ReplicationTaskIdentifier));
				})
			));
	}

	waitForInstance(id) {
		const checkStatus = resolve => {
			return this.dms.describeReplicationInstances({
				Filters: [{
					Name: 'replication-instance-id',
					Values: [id]
				}]
			})
				.then(response => {
					const status = response.ReplicationInstances[0].ReplicationInstanceStatus;
					if (status === 'available') {
						return resolve();
					}
					return;
				});
		}

		let interval;

		return new Promise((resolve) => {
			checkStatus(resolve);
			interval = setInterval(() => {
				checkStatus(resolve);
			}, 5000);
		})
			.then(() => {
				return clearInterval(interval);
			},
			error => {
				clearInterval(interval);
				throw error;
			});
	}

	waitForTask(id) {
		const checkStatus = resolve => {
			return this.dms.describeReplicationTasks({
				Filters: [{
					Name: 'replication-task-id',
					Values: [id]
				}]
			})
				.then(response => {
					const status = response.ReplicationTasks[0].Status;
					if (status !== 'creating') {
						return resolve();
					}
					return;
				});
		}

		let interval;

		return new Promise((resolve) => {
			checkStatus(resolve);
			interval = setInterval(() => {
				checkStatus(resolve);
			}, 5000);
		})
			.then(() => {
				return clearInterval(interval);
			},
			error => {
				clearInterval(interval);
				throw error;
			});
	}

	parseDefinition(definition) {
		objectutilities.map(definition, key => {
			const value = definition[key];

			if (_.isString(value)) {
				definition[key] = parserutilities.parse(value, this.variables);
				return;
			}

			if (_.isArray(value)) {
				definition[key] = arrayutilities.map(value, item => parserutilities.parse(item, this.variables));
				return;
			}

			if (_.isObject(value)) {
				definition[key] = this.parseDefinition(value);
				return;
			}
		})

		return definition;
	}
}

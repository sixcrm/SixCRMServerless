const _ = require('lodash');
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js')

module.exports = class DMSProvider extends AWSProvider {
	constructor(){
		super();
		this.instantiateAWS();
		this.dms = new this.AWS.DMS({
			apiVersion: '2016-01-01',
			region: this.getRegion()
		});
	}

	describeReplicationSubnetGroups(parameters) {
		return this.dms.describeReplicationSubnetGroups(parameters).promise();
	}

	describeReplicationInstances(parameters) {
		return this.dms.describeReplicationInstances(parameters).promise();
	}

	describeEndpoints(parameters) {
		return this.dms.describeEndpoints(parameters).promise();
	}

	describeReplicationTasks(parameters) {
		return this.dms.describeReplicationTasks(parameters).promise();
	}

	replicationSubnetGroupExists(id) {
		return this.describeReplicationSubnetGroups()
			.then(description => {
				return _.find(description.ReplicationSubnetGroups, subnet => {
					return subnet.ReplicationSubnetGroupIdentifier === id;
				}) !== undefined;
			});
	}

	replicationInstanceExists(id) {
		return this.describeReplicationInstances({
			Filters: [{
				Name: 'replication-instance-id',
				Values: [id]
			}]
		})
			.then(() => true)
			.catch(error => {
				if (error.code === 'ResourceNotFoundFault') {
					return false;
				}
				throw error;
			});
	}

	endpointExists(id) {
		return this.describeEndpoints({
			Filters: [{
				Name: 'endpoint-id',
				Values: [id]
			}]
		})
			.then(() => true)
			.catch(error => {
				if (error.code === 'ResourceNotFoundFault') {
					return false;
				}
				throw error;
			});
	}

	replicationTaskExists(id) {
		return this.describeReplicationTasks({
			Filters: [{
				Name: 'replication-task-id',
				Values: [id]
			}]
		})
			.then(() => true)
			.catch(error => {
				if (error.code === 'ResourceNotFoundFault') {
					return false;
				}
				throw error;
			});
	}

	createReplicationSubnetGroup(parameters) {
		return this.dms.createReplicationSubnetGroup(parameters).promise();
	}

	createReplicationInstance(parameters) {
		return this.dms.createReplicationInstance(parameters).promise();
	}

	createEndpoint(parameters) {
		return this.dms.createEndpoint(parameters).promise();
	}

	createReplicationTask(parameters) {
		return this.dms.createReplicationTask(parameters).promise();
	}

	startReplicationTask(parameters) {
		return this.dms.startReplicationTask(parameters).promise();
	}
}

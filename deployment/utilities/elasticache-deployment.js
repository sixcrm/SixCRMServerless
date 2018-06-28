
const _ = require('lodash');
const BBPromise = require('bluebird');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');

module.exports = class ElasticacheDeployment {

	constructor() {

		this.elasticacheprovider = new ElasticacheProvider();

		this.ec2provider = new EC2Provider();

		this.parameterFilters = {
			'create':{
				'required':['CacheClusterId', 'CacheClusterId','PreferredAvailabilityZones','AZMode','NumCacheNodes','CacheNodeType','Engine','EngineVersion','PreferredMaintenanceWindow','Port','SnapshotRetentionLimit','SnapshotWindow','SnapshotName'],
				'optional':['MaxRecords','Marker','ShowcaseCacheNodeInfo','ShowCacheClustersNotInReplicationGroups','SecurityGroupIds','CacheSecurityGroupNames']
			},
			'wait':{
				'required':['CacheClusterId'],
				'optional':['MaxRecords','Marker','ShowcaseCacheNodeInfo','ShowCacheClustersNotInReplicationGroups']
			},
			'destroy':{
				'required':['CacheClusterId'],
				'optional':['FinalSnapshotIdentifier']
			},
			'describe':{
				'required':[],
				'optional':['CacheClusterId','Marker','MaxRecords','ShowCacheClustersNotInReplicationGroups','ShowCacheNodeInfo']
			}
		}
	}

	async deployClusters(){

		du.debug('Deploy Clusters');

		const clusters = this.getParametersJSON('clusters');

		return BBPromise.each(clusters, (cluster) => {
			return this.deployCluster(cluster);
		}).then(() => {
			return 'Complete';
		});

	}

	async deployCluster(cluster_definition){

		du.debug('Deploy Cluster');

		let result = await this.clusterExists(cluster_definition);

		if(_.isNull(result)){

			du.info('Creating Cluster: ', cluster_definition);
			return this.createCluster(cluster_definition);

		}

		du.info('Cluster Exists: ', cluster_definition);
		return this.updateCluster(cluster_definition);

	}

	async clusterExists(parameters){

		du.debug('Cluster Exists');

		let argumentation = objectutilities.transcribe(
			{
				CacheClusterId: "CacheClusterId"
			},
			parameters,
			{},
			true
		);

		argumentation = objectutilities.transcribe(
			{
				ShowCacheClustersNotInReplicationGroups: "ShowCacheClustersNotInReplicationGroups",
				ShowCacheNodeInfo: "ShowCacheNodeInfo"
			},
			parameters,
			argumentation,
			false
		);

		let results = null;
		try {
			results = await this.elasticacheprovider.describeCacheClusters(argumentation);
		}catch(error){
			if(error.code != 'CacheClusterNotFound'){
				throw error;
			}
			return null;
		}

		if(_.has(results, 'CacheClusters') && _.isArray(results.CacheClusters)){
			if(arrayutilities.nonEmpty(results.CacheClusters)){
				if(results.CacheClusters.length == 1){
					return results.CacheClusters[0];
				}
				throw eu.getError('server', 'Multiple results returned', results);
			}
			return null;
		}

		throw eu.getError('server', 'Unexpected results: ', results);

	}

	async createCluster(cluster_definition){

		du.debug('Create Cluster');

		let security_group_ids = await this.getSecurityGroupIds(cluster_definition);

		if(!_.isNull(security_group_ids)){
			cluster_definition.SecurityGroupIds = security_group_ids;
			delete cluster_definition.SecurityGroupNames;
		}

		await this.elasticacheprovider.createCacheCluster(cluster_definition);

		return this.waitForCluster('cacheClusterAvailable', cluster_definition);

	}

	async getSecurityGroupIds(cluster_definition){

		du.debug('getSecurityGroupIds');

		if(_.has(cluster_definition, 'SecurityGroupNames') && arrayutilities.nonEmpty(cluster_definition.SecurityGroupNames)){

			let argumentation = {
				Filters: [{
					Name: "tag:Name",
					Values: cluster_definition.SecurityGroupNames
				}]
			};

			let results = await this.ec2provider.describeSecurityGroups(argumentation);

			if(_.has(results, 'SecurityGroups') && _.isArray(results.SecurityGroups)){

				if(results.SecurityGroups.length !== cluster_definition.SecurityGroupNames.length){
					throw eu.getError('server', 'Security Group arrays do not concur.');
				}

				return arrayutilities.map(results.SecurityGroups, (security_group) => security_group.GroupId);

			}

			throw eu.getError('server', 'Unexpected Results: ', results);

		}

		return null;

	}

	async waitForCluster(event_name, cluster_definition){

		du.debug('Wait For Cluster');

		const argumentation = {
			CacheClusterId: cluster_definition.CacheClusterId
		};

		return this.elasticacheprovider.waitFor(event_name, argumentation);

	}

	async updateCluster(cluster_definition){

		du.debug('Update Cluster');
		du.info(cluster_definition);
		//Technical Debt:  Finish this.
		return true;

	}

	async deploySubnetGroups(){

		du.debug('Deploy Subnet Groups');

		const subnet_groups = this.getParametersJSON('subnetgroups');

		return BBPromise.each(subnet_groups, (subnet_group) => {
			return this.deploySubnetGroup(subnet_group);
		}).then(() => {
			return 'Complete';
		});

	}

	async deploySubnetGroup(subnet_group_definition){

		du.debug('Deploy Subnet Group');

		let result = await this.subnetGroupExists(subnet_group_definition);

		if(_.isNull(result)){

			du.info('Creating Subnet Group: '+subnet_group_definition.CacheSubnetGroupName)
			return this.createSubnetGroup(subnet_group_definition);

		}

		du.info('Updating Subnet Group: '+subnet_group_definition.CacheSubnetGroupName);
		//Techical Debt:  Add a update method
		return true;

	}

	async subnetGroupExists(subnet_group_definition){

		du.debug('Subnet Group Exists');

		const argumentation = {
			CacheSubnetGroupName: subnet_group_definition.CacheSubnetGroupName
		};

		let results = null;

		try{
			results = await this.elasticacheprovider.describeCacheSubnetGroups(argumentation);
		}catch(error){
			if(error.code !== 'CacheSubnetGroupNotFoundFault'){
				throw error;
			}
		}

		if(_.has(results, 'CacheSubnetGroups') && _.isArray(results.CacheSubnetGroups)){
			if(arrayutilities.nonEmpty(results.CacheSubnetGroups)){
				if(results.CacheSubnetGroups.length == 1){
					return results.CacheSubnetGroups[0];
				}
				throw eu.getError('server', 'Multiple results returned: ', results);
			}
		}

		return null;

	}

	async createSubnetGroup(subnet_group_definition){

		du.debug('Create Subnet Group');

		let argumentation = {
			Filters:[{
				Name:'tag:Name',
				Values:subnet_group_definition.SubnetNames
			}]
		};

		let subnets = await this.ec2provider.describeSubnets(argumentation);

		if(_.has(subnets, 'Subnets') && _.isArray(subnets.Subnets)){
			subnets = arrayutilities.map(subnets.Subnets, (subnet) => subnet.SubnetId);
		}

		subnet_group_definition.SubnetIds = subnets;
		delete subnet_group_definition.SubnetNames;

		return this.elasticacheprovider.createCacheSubnetGroup(subnet_group_definition);

	}
	/*
	deploy() {

		du.debug('Deploy');

		return this.clusterExists('sixcrm').then((results) => {

			if(results == false){

				let parameters = this.createParametersObject('create');

				return this.appendEphemperalProperties(parameters).then((parameters) => {

					return this.createCacheCluster(parameters).then(() => {

						let wait_status = 'cacheClusterAvailable';

						parameters = this.createParametersObject('wait', wait_status);

						return this.waitForCluster(parameters, wait_status).then(() => {

							return 'Complete';

						});

					});

				});

			}else{

				return 'Complete';

			}

		});

	}

	appendEphemperalProperties(parameters){

		du.debug('Append Ephemeral Properties');

		let security_group_identifier = 'SixCRM-Elasticache';

		return this.ec2provider.securityGroupExists(security_group_identifier).then((result) => {

			if(_.isNull(result) || result == false || !_.has(result, 'GroupId')){
				throw eu.getError('server', 'Missing ephemeral property: Elasticache SecurityGroup ID.  Please check EC2 configuration.');
			}

			parameters['SecurityGroupIds'] = [result.GroupId];

			return parameters;

		});

	}

	clusterExists(cluster_id){

		du.debug('Cluster Exists');

		let parameters = this.createParametersObject('describe');

		return this.describeClusters(parameters).then((results) => {

			if(_.has(results, 'CacheClusters') &&   arrayutilities.isArray(results.CacheClusters) && results.CacheClusters.length > 0){

				let found = arrayutilities.find(results.CacheClusters, (cluster) => {

					if(_.has(cluster, 'CacheClusterId') && cluster.CacheClusterId == cluster_id){ return true; }

					return false;

				});

				if(objectutilities.isObject(found)){

					du.info('Cluster exists');

					return found;

				}

			}

			du.info('Unable to identify cluster');

			return false;

		});

	}

	destroy(){

		du.debug('Destroy');

		return this.clusterExists('sixcrm').then((results) => {

			if(results == false){

				return 'Complete';

			}else{

				let parameters = this.createParametersObject('destroy');

				return this.destroyCacheCluster(parameters).then(() => {

					let wait_status = 'cacheClusterDeleted';

					parameters = this.createParametersObject('wait', wait_status);

					return this.waitForCluster(parameters, wait_status).then(() => {

						return 'Complete';

					});

				});

			}

		});

	}
*/
	async purge(){

		du.debug('Purge');

		this.redisprovider = new RedisProvider();

		await this.redisprovider.withConnection(() => this.redisprovider.flushAll());

		return 'Complete';

	}
	/*
	createParametersObject(action, subaction){

		let parameters = this.getParametersJSON('sixcrm');

		parameters = this.filterParameters(parameters, action, subaction);

		return parameters;

	}
*/
	getParametersJSON(filename){

		du.debug('Get Parameters JSON');

		//Technical Debt:  This needs to be expanded to support multiple definitions...
		return global.SixCRM.routes.include('deployment', 'elasticache/configuration/'+filename+'.json');

	}

/*
	filterParameters(parameters, action){

		du.debug('Filter Parameters');

		if(!_.includes(objectutilities.getKeys(this.parameterFilters), action)){
			throw eu.getError('server', 'Unknown action');
		}

		let action_settings = this.parameterFilters[action];

		let required_parameters = objectutilities.additiveFilter(action_settings.required, parameters);

		let optional_parameters = objectutilities.additiveFilter(action_settings.optional, parameters);

		let merged = objectutilities.merge(required_parameters, optional_parameters);

		return merged;

	}

	describeClusters(parameters){

		du.debug('Describe Clusters');

		return this.elasticacheprovider.describeClusters(parameters);

	}

	createCacheCluster(parameters){

		du.debug('Create Cache Cluster');

		return this.elasticacheprovider.createCluster(parameters);

	}

	destroyCacheCluster(parameters){

		du.debug('Destroy Cache Cluster');

		return this.elasticacheprovider.destroyCluster(parameters);

	}

	waitForCluster(parameters, status){

		du.debug('Wait For Cluster');

		return this.elasticacheprovider.waitFor(parameters, status);

	}
*/
}

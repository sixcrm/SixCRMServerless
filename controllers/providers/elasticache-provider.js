const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
//const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class ElasticacheProvider extends AWSProvider{

	constructor(){

		super();

		//let region = (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'elasticache.region'))?global.SixCRM.configuration.site_config.elasticache.region:this.getRegion();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.elasticache = new this.AWS.ElastiCache({
			apiVersion: '2015-02-02',
			region: global.SixCRM.configuration.site_config.aws.region
		});

		this.clusterStati = ['cacheClusterAvailable','cacheClusterDeleted','replicationGroupAvailable','replicationGroupDeleted'];

	}

	waitfor(event_name, parameters){

		du.debug('Wait For');

		return this.elasticache.waitFor(event_name, parameters).promise();

	}

	createCacheCluster(parameters){

		du.debug('Create Cache Clusters');

		return this.elasticache.createCacheCluster(parameters).promise();

	}

	describeCacheClusters(parameters){

		du.debug('Describe Cache Clusters');

		return this.elasticache.describeCacheClusters(parameters).promise();

	}

	describeCacheSubnetGroups(parameters){

		du.debug('Describe Cache Subnet Group');

		return this.elasticache.describeCacheSubnetGroups(parameters).promise();

	}

	createCacheSubnetGroup(parameters){

		du.debug('Create Cache Subnet Group');

		return this.elasticache.createCacheSubnetGroup(parameters).promise();

	}

	destroyCluster(parameters){

		du.debug('Destroy Cluster');

		return new Promise((resolve) => {

			this.elasticache.deleteCacheCluster(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	createCluster(parameters){

		du.debug('Create Cluster');

		return new Promise((resolve) => {

			this.elasticache.createCacheCluster(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	describeClusters(parameters){

		du.debug('Describe Clusters');

		return new Promise((resolve) => {

			this.elasticache.describeCacheClusters(parameters, (error, data) => {

				if(error){
					if(error.code == 'CacheClusterNotFound'){
						return resolve(null);
					}else{
						throw eu.getError('server', error);
					}
				}

				return resolve(data);

			});

		});

	}

	waitFor(parameters, status){

		du.debug('Wait For');

		return new Promise((resolve) => {

			if(!_.includes(this.clusterStati, status)){ throw eu.getError('server', 'Unknown status type.'); }

			this.elasticache.waitFor(status, parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}


}

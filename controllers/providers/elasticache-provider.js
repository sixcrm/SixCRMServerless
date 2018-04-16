
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');

const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class ElasticacheProvider extends AWSProvider{

	constructor(){

		super();

		let region = (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'elasticache.region'))?global.SixCRM.configuration.site_config.elasticache.region:this.getRegion();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.elasticache = new this.AWS.ElastiCache({
			apiVersion: '2015-02-02',
			region: region,
			endpoint: global.SixCRM.configuration.site_config.elasticache.endpoint
		});

		this.clusterStati = ['cacheClusterAvailable','cacheClusterDeleted','replicationGroupAvailable','replicationGroupDeleted'];

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


const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

/*
* Technical Debt: Evaluate the manner by which we instantiate and connect on-demand.  In particular, client pooling is probably a good idea.
* Technical Debt: This utility executes arbitrary queries with little/no query sanitization.
* Technical Debt: Closing the connection to Redshift is blocking.
*/

module.exports = class RedshiftProvider extends AWSProvider {

	constructor(){

		super();

		this.instantiateRedshift();

	}

	instantiateRedshift(){

		du.debug('Instantiate Redshift');

		let endpoint_url = (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'redshift.endpoint'))?global.SixCRM.configuration.site_config.redshift.endpoint:null;
		let port = (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'redshift.port'))?global.SixCRM.configuration.site_config.redshift.port:null;
		let region = (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'redshift.region'))?global.SixCRM.configuration.site_config.redshift.region:this.getRegion();

		let parameters = {
			apiVersion: '2013-01-01',
			region: region
		};

		if(!_.isNull(endpoint_url) && !_.isNull(port)){
			parameters.endpoint = endpoint_url+':'+port;
		}

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.redshift = new this.AWS.Redshift(parameters);

	}

	createClusterSnapshot(parameters){

		du.debug('Create Cluster Snapshot');

		parameters = (_.isUndefined(parameters) || !objectutilities.isObject(parameters, false))?{}:parameters;

		parameters = objectutilities.transcribe(
			{
				ClusterIdentifier:'ClusterIdentifier',
				SnapshotIdentifier: 'SnapshotIdentifier'
			},
			parameters,
			{},
			false
		);

		if(!_.has(parameters, 'ClusterIdentifier')){
			parameters.ClusterIdentifier = global.SixCRM.configuration.site_config.redshift.default_cluster_identifier;
		}

		if(!_.has(parameters, 'SnapshotIdentifier')){
			parameters.SnapshotIdentifier = 'sixtriggered-'+timestamp.getISO8601();
		}

		return new Promise((resolve, reject) => {

			return this.redshift.createClusterSnapshot(parameters, function(error, data) {

				if (error) {

					du.error(error);
					return reject(error);

				} else {

					if(objectutilities.hasRecursive(data, 'Snapshot.Status') && data.Snapshot.Status == 'creating'){
						return resolve(data);
					}

					du.error('Unexpected response from AWS', data);
					return reject(new Error('Unexpected response from AWS: '+data));

				}

			});

		});

	}

	clusterExists(parameters) {

		du.debug('Cluster Exists');

		return new Promise((resolve) => {

			return this.redshift.describeClusters(parameters, (error, data) => {
				if (error) {
					return resolve(false);
				} else {
					if(_.has(data, 'Clusters') && _.isArray(data.Clusters) && data.Clusters.length > 0){
						return resolve(true);
					}else{
						return resolve(false)
					}

				}
			});

		});

	}

	describeCluster(parameters) {

		du.debug('Describe Cluster');

		return new Promise((resolve, reject) => {

			return this.redshift.describeClusters(parameters, (error, data) => {
				if (error) {

					du.error(error);

					return reject(error);
				} else {
					return resolve(data);
				}
			});

		});

	}

	deleteCluster(parameters) {

		du.debug('Delete Cluster');

		//let parameters = this.createParametersObject('destroy');

		return new Promise((resolve, reject) => {
			this.redshift.deleteCluster(parameters, (error, data) => {
				if (error) {
					du.error(error.message);
					return reject(error);
				} else {
					return resolve(data);
				}
			});
		});

	}

	waitForCluster(state, parameters) {

		//let parameters = this.createParametersObject('wait');

		return new Promise((resolve, reject) => {
			this.redshift.waitFor(state, parameters, (error, data) => {
				if (error) {
					du.error(error.message);
					return reject(error);
				} else {
					return resolve(data);
				}
			});
		});

	}

	createCluster(parameters) {

		du.debug('Create Cluster');

		return new Promise((resolve, reject) => {
			this.redshift.createCluster(parameters, (error, data) => {
				if (error) {
					du.error(error.message);
					return reject(error);
				} else {
					return resolve(data);
				}
			});
		});

	}

}

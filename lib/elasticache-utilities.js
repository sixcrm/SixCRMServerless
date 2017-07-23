'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

class ElasticacheUtilities {

    constructor(){

      this.elasticache = new AWS.ElastiCache({
        apiVersion: '2015-02-02',
        region: global.SixCRM.configuration.site_config.aws.region
      });

      this.clusterStati = ['cacheClusterAvailable','cacheClusterDeleted','replicationGroupAvailable','replicationGroupDeleted'];

    }

    destroyCluster(parameters){

      du.debug('Destroy Cluster');

      return new Promise((resolve) => {

        this.elasticache.deleteCacheCluster(parameters, function(error, data) {

          if(error){ eu.throwError('server', error); }

          return resolve(data);

        });

      });

    }

    createCluster(parameters){

      du.debug('Create Cluster');

      return new Promise((resolve) => {

        this.elasticache.createCacheCluster(parameters, function(error, data) {

          if(error){ eu.throwError('server', error); }

          return resolve(data);

        });

      });

    }

    waitFor(parameters, status){

      du.debug('Wait For');

      return new Promise((resolve) => {

        if(!_.contains(this.clusterStati, status)){ eu.throwError('server', 'Unknown status type.'); }

        this.elasticache.waitFor(status, parameters, function(error, data) {

          if(error){ eu.throwError('server', error); }

          return resolve(data);

        });

      });

    }


}

module.exports = new ElasticacheUtilities();

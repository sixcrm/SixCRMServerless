'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');

class ElasticacheUtilities {

    constructor(stage){

      this.stage = configurationutilities.resolveStage(stage);

      this.site_config = configurationutilities.getSiteConfig(this.stage);

      this.elasticache = new AWS.ElastiCache({
        apiVersion: '2015-02-02',
        region: this.site_config.aws.region
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

var ec = new ElasticacheUtilities(process.env.stage);

module.exports = ec;

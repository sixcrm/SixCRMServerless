'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');

module.exports = class ElasticacheDeployment {

  constructor() {

    this.elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

    this.redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

    this.ec2utilities = new EC2Utilities();

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

    return this.ec2utilities.securityGroupExists(security_group_identifier).then((result) => {

      if(_.isNull(result) || result == false || !_.has(result, 'GroupId')){
        eu.throwError('server', 'Missing ephemeral property: Elasticache SecurityGroup ID.  Please check EC2 configuration.');
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

          du.highlight('Cluster exists');

          return found;

        }

      }

      du.highlight('Unable to identify cluster');

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

  purge(){

    du.debug('Purge');

    return this.redisutilities.flushAll().then(() => {
      return 'Complete';
    });

  }

  createParametersObject(action, subaction){

    let parameters = this.getParametersJSON('sixcrm');

    parameters = this.filterParameters(parameters, action, subaction);

    return parameters;

  }

  getParametersJSON(filename){

    du.debug('Get Parameters JSON');

    //Technical Debt:  This needs to be expanded to support multiple definitions...
    return global.SixCRM.routes.include('deployment', 'elasticache/clusters/'+filename+'.json');

  }

  filterParameters(parameters, action){

    du.debug('Filter Parameters');

    if(!_.contains(objectutilities.getKeys(this.parameterFilters), action)){
      eu.throwError('server', 'Unknown action');
    }

    let action_settings = this.parameterFilters[action];

    let required_parameters = objectutilities.additiveFilter(action_settings.required, parameters);

    let optional_parameters = objectutilities.additiveFilter(action_settings.optional, parameters);

    let merged = objectutilities.merge(required_parameters, optional_parameters);

    return merged;

  }

  describeClusters(parameters){

    du.debug('Describe Clusters');

    return this.elasticacheutilities.describeClusters(parameters);

  }

  createCacheCluster(parameters){

    du.debug('Create Cache Cluster');

    return this.elasticacheutilities.createCluster(parameters);

  }

  destroyCacheCluster(parameters){

    du.debug('Destroy Cache Cluster');

    return this.elasticacheutilities.destroyCluster(parameters);

  }

  waitForCluster(parameters, status){

    du.debug('Wait For Cluster');

    return this.elasticacheutilities.waitFor(parameters, status);

  }

}

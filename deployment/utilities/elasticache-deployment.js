'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

module.exports = class ElasticacheDeployment {

  constructor(stage) {

    this.elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

    this.redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

    this.parameterFilters = {
      'create':{
        'required':['CacheClusterId', 'CacheClusterId','PreferredAvailabilityZones','AZMode','NumCacheNodes','CacheNodeType','Engine','EngineVersion','PreferredMaintenanceWindow','Port','SnapshotRetentionLimit','SnapshotWindow','SnapshotName'],
        'optional':['MaxRecords','Marker','ShowcaseCacheNodeInfo','ShowCacheClustersNotInReplicationGroups']
      },
      'wait':{
        'required':['CacheClusterId'],
        'optional':['MaxRecords','Marker','ShowcaseCacheNodeInfo','ShowCacheClustersNotInReplicationGroups']
      },
      'destroy':{
        'required':['CacheClusterId'],
        'optional':['FinalSnapshotIdentifier']
      }
    }
  }

  deploy() {

    du.debug('Deploy');

    let parameters = this.createParametersObject('create');

    return this.createCacheCluster(parameters).then(() => {

      let wait_status = 'cacheClusterAvailable';

      parameters = this.createParametersObject('wait', wait_status);

      return this.waitForCluster(parameters, wait_status).then(() => {

        return 'Complete';

      });

    });

  }

  destroy(){

    du.debug('Destroy');

    let parameters = this.createParametersObject('destroy');

    return this.destroyCacheCluster(parameters).then(() => {

      let wait_status = 'cacheClusterDeleted';

      parameters = this.createParametersObject('wait', wait_status);

      return this.waitForCluster(parameters, wait_status).then(() => {

        return 'Complete';

      });

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

  filterParameters(parameters, action, subaction){

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

  createCacheCluster(parameters){

    return this.elasticacheutilities.createCluster(parameters);

  }

  destroyCacheCluster(parameters){

    return this.elasticacheutilities.destroyCluster(parameters);

  }

  waitForCluster(parameters, status){

    return this.elasticacheutilities.waitFor(parameters, status);

  }

}

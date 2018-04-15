const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class RDSDeployment extends AWSDeploymentUtilities {

  constructor(){

    super();

    const RDSProvider = global.SixCRM.routes.include('providers', 'rds-provider.js');
    this.rdsprovider = new RDSProvider();

  }

  clusterExists(cluster_definition){

    du.debug('Cluster Exists');

    let argumentation = {
      DBClusterIdentifier: cluster_definition.DBClusterIdentifier
    };

    return this.rdsprovider.describeClusters(argumentation).then(result => {

      if(_.has(result, 'DBClusters') && _.isArray(result.DBClusters)){

        if(arrayutilities.nonEmpty(result.DBClusters)){
          if(result.DBClusters.length == 1){
            return result.DBClusters[0];
          }
          eu.throwError('Multiple records returned: ', result);
        }

        return null;

      }

      eu.throwError('server','Unexpected result: ', result);

    });

  }

}

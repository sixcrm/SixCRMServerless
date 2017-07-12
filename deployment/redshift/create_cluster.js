'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.routes.include('deployment', 'utilities/string-utilities.js');
const RedshiftDeployment = global.routes.include('deployment', 'utilities/redshift-deployment.js');

let environment = process.argv[2] || 'development';

du.highlight('Creating Redshift Cluster');

let redshiftDeployment = new RedshiftDeployment(environment);

let cluster_parameters = {};

cluster_parameters['MasterUsername'] = redshiftDeployment.config['user'];
cluster_parameters['MasterUserPassword'] = redshiftDeployment.config['password'];
cluster_parameters['DBName'] = redshiftDeployment.config['database'];

Object.keys(redshiftDeployment.config.cluster).forEach((key) => {
    let key_name = stringUtilities.toPascalCase(key);

    cluster_parameters[key_name] = redshiftDeployment.config.cluster[key];

});

du.output('Cluster parameters are:', cluster_parameters);

redshiftDeployment.clusterExists(cluster_parameters.ClusterIdentifier).then(exists => {
    if (exists) {
        du.warning('Cluster exists, aborting.');
        return Promise.resolve();
    } else {
        du.output('Cluster does not exist, creating.');
        return redshiftDeployment.createClusterAndWait(cluster_parameters).then(response => {
            du.output(response);
        });
    }
}).then(() => { du.highlight('Complete')});

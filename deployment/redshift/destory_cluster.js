'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.routes.include('deployment', 'utilities/string-utilities.js');
const RedshiftDeployment = global.routes.include('deployment', 'utilities/redshift-deployment.js');

let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';

du.highlight('Destroying Redshift Cluster');

let redshiftDeployment = new RedshiftDeployment(environment);

let cluster_parameters = {};

Object.keys(redshiftDeployment.config).forEach((key) => {
    let key_name = stringUtilities.toPascalCase(key);

    cluster_parameters[key_name] = redshiftDeployment.config[key];
    du.output('Cluster parameters are:', cluster_parameters);
});

redshiftDeployment.clusterExists(cluster_parameters.ClusterIdentifier).then(exists => {
    if (!exists) {
        du.warning('Cluster does not exist, aborting.');
        return Promise.resolve();
    } else {
        du.output('Cluster exists, destroying.');
        return redshiftDeployment.deleteClusterAndWait(cluster_parameters).then(response => {
            du.output(response);
        });
    }
}).then(() => { du.highlight('Complete')});



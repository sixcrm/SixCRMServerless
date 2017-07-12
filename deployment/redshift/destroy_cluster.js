'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.routes.include('deployment', 'utilities/string-utilities.js');
const RedshiftDeployment = global.routes.include('deployment', 'utilities/redshift-deployment.js');

let environment = process.argv[2] || 'development';

du.highlight('Destroying Redshift Cluster');

let redshiftDeployment = new RedshiftDeployment(environment);

let cluster_parameters = {
    ClusterIdentifier: redshiftDeployment.config.cluster['cluster_identifier'],
    FinalClusterSnapshotIdentifier: redshiftDeployment.config.cluster['final_cluster_snapshot_identifier'],
    SkipFinalClusterSnapshot: redshiftDeployment.config.cluster['skip_final_cluster_snapshot']
};

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

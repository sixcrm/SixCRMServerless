'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');
const RedshiftDeployment = global.routes.include('deployment', 'utilities/redshift-deployment.js');

let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';

du.highlight('Creating Redshift Cluster');


let redshiftDeployment = new RedshiftDeployment(environment);

var cluster_parameters = {
    ClusterIdentifier: 'sixcrm-development', /* required */
    MasterUserPassword: 'Jagodica9', /* required */
    MasterUsername: 'admin', /* required */
    NodeType: 'dc1.large', /* required */ /*Valid Values: ds1.xlarge | ds1.8xlarge | ds2.xlarge | ds2.8xlarge | dc1.large | dc1.8xlarge.*/
    AutomatedSnapshotRetentionPeriod: 3, /**/
    ClusterType: 'single-node', /*single-node multi-node*/
    DBName: 'dev',
    AvailabilityZone :'us-east-1a',
    //NumberOfNodes: 0,
    PubliclyAccessible: true
};

redshiftDeployment.clusterExists(cluster_parameters.ClusterIdentifier).then(exists => {
    if (exists) {
        du.highlight('Cluster exists, purging tables.');
        return redshiftDeployment.purgeTables().then(response => {
            du.highlight(response);
        });
    } else {
        du.highlight('Cluster does not exist, creating.');
        return redshiftDeployment.createClusterAndWait(cluster_parameters).then(response => {
            du.highlight(response);
        });
    }
}).then(() => { du.highlight('Complete')});



'use strict';
require('require-yaml');
const _ = require('underscore');
const AWS = require("aws-sdk");

const du = global.routes.include('lib', 'debug-utilities.js');
const BaseDeployment = global.routes.include('deployment', 'utilities/base-deployment.js');

class RedshiftDeployment extends BaseDeployment {

    constructor(stage) {
        super(stage);
        this.stage = stage;
        this.config = this.getConfig(stage);
        this.redshift = new AWS.Redshift({
            region: this.aws_config.region,
            apiVersion: '2013-01-01',
        });
    }

    clusterExists(cluster_identifier) {

        let parameters = {
            ClusterIdentifier: cluster_identifier,
        };

        return new Promise((resolve, reject) => {
            this.redshift.describeClusters(parameters, (error, data) => {
                if (error) {
                    return resolve(false);
                } else {
                    return resolve(true);
                }
            });
        });
    }

    createCluster(parameters) {

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

    createClusterAndWait(parameters) {
        return this.createCluster(parameters).then(() => {
            return this.waitForCluster(parameters.ClusterIdentifier, 'clusterAvailable');
        });
    }

    deleteCluster(parameters) {

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

    deleteClusterAndWait(parameters) {
        return this.deleteCluster(parameters).then(() => {
            return this.waitForCluster(parameters.ClusterIdentifier, 'clusterDeleted');
        });
    }

    waitForCluster(cluster_identifier, state) {
        let parameters = {
            ClusterIdentifier: cluster_identifier
        };

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

    getConfig() {
        let config = global.routes.include('config', `${this.stage}/site.yml`).redshift;

        if (!config) {
            throw 'Unable to find config file.';
        }
        return config;
    }

}

module.exports = RedshiftDeployment;

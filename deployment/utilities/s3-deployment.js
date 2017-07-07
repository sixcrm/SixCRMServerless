'use strict';
require('require-yaml');
const fs = require('fs');
const _ = require('underscore');
const AWS = require("aws-sdk");

const du = global.routes.include('lib', 'debug-utilities.js');

class S3Deployment {

    constructor(stage) {
        this.stage = stage;
        this.config = this.getConfig(stage);
        this.s3 = new AWS.S3({
            region: 'us-east-1',
            apiVersion: '2006-03-01',
        });
    }

    bucketExists(Bucket_identifier) {
       /* Test if Bucket exists */

       var parameters = {
           Bucket: Bucket_identifier
       };

       return new Promise((resolve, reject) => {
           this.s3.headBucket(parameters, (error, data) => {
               if (error) {
                   return resolve(false);
               } else {
                   return resolve(true);
               }
           });
       });

    }

    createBucket(parameters) {
        /* Create Bucket */

        return new Promise((resolve, reject) => {
            this.s3.createBucket(parameters, (error, data) => {
                if (error) {
                    du.error(error.message);
                    return reject(error);
                } else {
                    return resolve(data);
                }
            });
        });
    }

    createBucketAndWait(parameters) {
      return this.createBucket(parameters).then(() => {
          return this.waitForBucketToExist(parameters.DeliveryBucketName);
      });
    }

    deleteBucket(parameters) {
        /* Delete Bucket */

      return new Promise((resolve, reject) => {
          this.s3.deleteBucket(parameters, (error, data) => {
              if (error) {
                  du.error(error.message);
                  return reject(error);
              } else {
                  return resolve(data);
              }
          });
      });
    }

    deleteBucketAndWait(parameters) {
        /* Delete Bucket and wait */

        return this.deleteBucket(parameters).then(() => {
            return this.waitForBucketNotExist(parameters.DeliveryBucketName);
        });
    }

    waitForBucket(cluster_identifier, state) {
        let parameters = {
            Bucket: cluster_identifier
        };

        return new Promise((resolve, reject) => {
            this.s3.waitFor(state, parameters, (error, data) => {
                if (error) {
                    du.error(error.message);
                    return reject(error);
                } else {
                    return resolve(data);
                }
            });
        });
    }

    waitForBucketToExist(bucket_identifier) {
        /* Exists wrapper */
        return this.waitForBucket(bucket_identifier, 'bucketExists');
    }

    waitForBucketNotExist(bucket_identifier) {
        /* Exists wrapper */
        return this.waitForBucket(bucket_identifier, 'bucketNotExists');
    }

    getConfig() {
        let config = global.routes.include('config', `${this.stage}/site.yml`).s3.redshift;

        if (!config) {
            throw 'Unable to find config file.';
        }
        return config;
    }

}

module.exports = S3Deployment;

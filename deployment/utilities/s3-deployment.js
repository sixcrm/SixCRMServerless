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

    bucketExists(parameters) {
       /* Test if Bucket exists */

       var param = {
           Bucket: parameters.Bucket
       };

       return new Promise((resolve, reject) => {
           this.s3.headBucket(param, (error, data) => {
               if (error) {
                   return resolve(false);
               } else {
                   return resolve(true);
               }
           });
       });

    }

    folderExists(parameters) {
       /* Test if Bucket exists */

       var param = {
           Bucket: parameters.Bucket,
           Key: parameters.Key
       };

       return new Promise((resolve, reject) => {
           this.s3.headObject(param, (error, data) => {
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

        var param = {
            Bucket: parameters.Bucket
        };

        return new Promise((resolve, reject) => {
            this.s3.createBucket(param, (error, data) => {
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
          return this.waitForBucketToExist(parameters.Bucket);
      });
    }

    createFolderAndWait(parameters) {
      return this.createFolder(parameters).then(() => {
          return this.waitForFolderToExist(parameters.Bucket);
      });
    }

    deleteBucket(parameters) {
        /* Delete Bucket */

      var param = {
          Bucket: parameters.Bucket
      };

      return new Promise((resolve, reject) => {
          this.s3.deleteBucket(param, (error, data) => {
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
            return this.waitForBucketNotExist(parameters.Bucket);
        });
    }

    waitForBucket(cluster_identifier, state) {
        let param = {
            Bucket: cluster_identifier
        };

        return new Promise((resolve, reject) => {
            this.s3.waitFor(state, param, (error, data) => {
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

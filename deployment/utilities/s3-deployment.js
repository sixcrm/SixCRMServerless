'use strict';
require('require-yaml');
const _ = require('underscore');
const AWS = require("aws-sdk");

const du = global.routes.include('lib', 'debug-utilities.js');
const BaseDeployment = global.routes.include('deployment', 'utilities/base-deployment.js');

class S3Deployment extends BaseDeployment {

    constructor(stage) {
        super(stage);
        this.stage = stage;
        this.config = this.getConfig(stage);
        this.s3 = new AWS.S3({
            region: this.aws_config.region,
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

    createFolder(parameters) {
        /* Create Bucket */

        var param = {
            Bucket: parameters.Bucket,
            Key: parameters.Key
        };

        return new Promise((resolve, reject) => {
            this.s3.putObject(param, (error, data) => {
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
          return this.waitForFolderToExist(parameters);
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

    deleteFolder(parameters) {
        /* Delete Bucket */

      var param = {
          Bucket: parameters.Bucket,
          Key: parameters.Key
      };

      return new Promise((resolve, reject) => {
          this.s3.deleteObject(param, (error, data) => {
              if (error) {
                  du.error(error.message);
                  return reject(error);
              } else {
                  return resolve(data);
              }
          });
      });
    }

    deleteFolderAndWait(parameters) {
        /* Delete Bucket and wait */

        return this.deleteFolder(parameters).then(() => {
            return this.waitForFolderNotExist(parameters);
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

    waitForFolder(parameters, state) {

      var param = {
          Bucket: parameters.Bucket,
          Key: parameters.Key
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

    waitForFolderToExist(parameters) {
        /* Exists wrapper */
        return this.waitForFolder(parameters, 'objectExists');
    }

    waitForFolderNotExist(parameters) {
        /* Exists wrapper */
        return this.waitForFolder(parameters, 'objectNotExists');
    }

    getConfig() {
        let config = global.routes.include('config', `${this.stage}/site.yml`).s3.redshift;

        if (!config) {
            throw 'Unable to find config file.';
        }
        return config;
    }

    listObjects(parameters) {

      var param = {
          Bucket: parameters.Bucket
      };

      return new Promise((resolve, reject) => { this.s3.listObjects(param, (error, data) => {
              if (error) {
                  du.error(error.message);
                  return reject(error);
              } else {
                  //console.log(data.Contents)
                  return resolve(data.Contents);
              }
          });
        });

    }

}

module.exports = S3Deployment;

'use strict';
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');
const fileutilities = global.routes.include('lib', 'file-utilities.js');
const parserutilities = global.routes.include('lib', 'parser-utilities.js');

class S3Deployment{

    constructor(stage) {

      this.stage = configurationutilities.resolveStage(stage);

      this.site_config = configurationutilities.getSiteConfig(this.stage);

      this.s3utilities = global.routes.include('lib', 's3-utilities.js');

      this.bucket_name_template = 'sixcrm-{{stage}}-{{bucket_name}}';

    }

    createBuckets(){

      du.debug('Create Buckets');

      let bucket_group_files = fileutilities.getDirectoryFilesSync(global.routes.path('deployment','s3/buckets'));

      if(!_.isArray(bucket_group_files)){
        eu.throwError('server', 'S3Deployment.destroyBuckets assumes that the bucket_group_files is an array of file names.');
      }

      let bucket_promises = [];

      bucket_group_files.forEach((bucket_group_file) => {

        let bucket_group_file_contents = global.routes.include('deployment', 's3/buckets/'+bucket_group_file);

        if(!_.isArray(bucket_group_file_contents)){ eu.throwError('server', 'S3Deployment.destroyBuckets assumes that the JSON files are arrays.'); }

        bucket_promises.push(this.createBucketFromGroupFileDefinition(bucket_group_file_contents));

      });

      return Promise.all(bucket_promises).then(() => {

        return 'Complete';

      });

    }

    destroyBuckets(){

      du.debug('Destroy Buckets');

      let bucket_group_files = fileutilities.getDirectoryFilesSync(global.routes.path('deployment','s3/buckets'));

      if(!_.isArray(bucket_group_files)){ eu.throwError('server', 'S3Deployment.destroyBuckets assumes that the bucket_group_files is an array of file names.'); }

      let bucket_promises = [];

      bucket_group_files.forEach((bucket_group_file) => {

        let bucket_group_file_contents = global.routes.include('deployment', 's3/buckets/'+bucket_group_file);

        if(!_.isArray(bucket_group_file_contents)){ eu.throwError('server', 'S3Deployment.destroyBuckets assumes that the JSON files are arrays.'); }

        bucket_promises.push(this.deleteBucketFromGroupFileDefinition(bucket_group_file_contents));

      });

      return Promise.all(bucket_promises).then(() => {

        return 'Complete';

      });

    }

    createBucketPath(bucket_name, prepended_path){

      let return_path = bucket_name;

      if(!_.isUndefined(prepended_path)){

        return_path = prepended_path+'/'+return_path;

      }

      return return_path;

    }

    createBucketFromGroupFileDefinition(group_file_definition){

      let group_file_definition_promises = group_file_definition.map((sub_definition) => {

        let bucket_name = this.createEnvironmentSpecificBucketName(sub_definition.Bucket);

        return this.s3utilities.assureBucket(bucket_name);

      });

      return Promise.all(group_file_definition_promises);

    }

    deleteBucketFromGroupFileDefinition(group_file_definition){

      let group_file_definition_promises = group_file_definition.map((sub_definition) => {

        let bucket_name = this.createEnvironmentSpecificBucketName(sub_definition.Bucket);

        return this.s3utilities.assureDelete(bucket_name);

      });

      return Promise.all(group_file_definition_promises);

    }

    bucketExists(parameters) {
       /* Test if Bucket exists */

       var param = {
           Bucket: parameters.Bucket
       };

       return new Promise((resolve) => {
           this.s3.headBucket(param, (error) => {
               if (error) {
                   return resolve(false);
               } else {
                   return resolve(true);
               }
           });
       });

    }

    //Technical Debt:  So, folders aren't actually things in S3?
    folderExists(parameters) {
       /* Test if Bucket exists */

       var param = {
           Bucket: parameters.Bucket,
           Key: parameters.Key
       };

       return new Promise((resolve) => {
           this.s3.headObject(param, (error) => {
               if (error) {
                  //Technical Debt:  False negatives...
                   return resolve(false);
               } else {
                   return resolve(true);
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

    createEnvironmentSpecificBucketName(bucket_name){

      return parserutilities.parse(this.bucket_name_template, {stage: this.stage, bucket_name: bucket_name});

    }

}

module.exports = S3Deployment;

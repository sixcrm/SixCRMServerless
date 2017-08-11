'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

class S3Deployment extends AWSDeploymentUtilities{

    constructor() {

      super();

      this.s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

      this.bucket_name_template = 'sixcrm-{{stage}}-{{bucket_name}}';

    }

    createBuckets(){

      du.debug('Create Buckets');

      let bucket_group_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment','s3/buckets'));

      if(!_.isArray(bucket_group_files)){
        eu.throwError('server', 'S3Deployment.destroyBuckets assumes that the bucket_group_files is an array of file names.');
      }

      let bucket_promises = [];

      bucket_group_files.forEach((bucket_group_file) => {

        du.info(bucket_group_file);

        let bucket_group_file_contents = global.SixCRM.routes.include('deployment', 's3/buckets/'+bucket_group_file);

        if(!_.isArray(bucket_group_file_contents)){ eu.throwError('server', 'S3Deployment.createBuckets assumes that the JSON files are arrays.'); }

        bucket_promises.push(this.createBucketFromGroupFileDefinition(bucket_group_file_contents));

      });

      return Promise.all(bucket_promises).then(() => {

        return 'Complete';

      });

    }

    destroyBuckets(){

      du.debug('Destroy Buckets');

      let bucket_group_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment','s3/buckets'));

      if(!_.isArray(bucket_group_files)){ eu.throwError('server', 'S3Deployment.destroyBuckets assumes that the bucket_group_files is an array of file names.'); }

      let bucket_promises = [];

      bucket_group_files.forEach((bucket_group_file) => {

        let bucket_group_file_contents = global.SixCRM.routes.include('deployment', 's3/buckets/'+bucket_group_file);

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

      du.debug('Create Bucket From Group File Definition');

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

    bucketExists(parameters){

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

    createEnvironmentSpecificBucketName(bucket_name){

      return parserutilities.parse(this.bucket_name_template, {stage: process.env.stage, bucket_name: bucket_name});

    }

}

module.exports = new S3Deployment();

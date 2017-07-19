'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.routes.include('lib', 'array-utilities.js');

class S3Utilities {

    constructor(){

        this.s3 = new AWS.S3({
          apiVersion: '2006-03-01',
          region: 'us-east-1'
        });

    }

    assureDelete(bucket_name){

      du.debug('Assure Delete');

      return new Promise((resolve, reject) => {

        return this.bucketExists(bucket_name).then((result) => {

          if(result == true){

            return this.deleteBucket(bucket_name).then(() => {

                return resolve(true);

            }).catch((error) => {

                du.warning('S3 error (destroy bucket): ', error);

                return reject(error);

            });

          }else{

            du.warning('Bucket does not exist: "'+bucket_name+'"');

            return resolve(false);

          }

        });

      });

    }

    deleteBucketObjects(bucket_name){

      du.debug('Delete Bucket Objects');

      return this.listObjects(bucket_name).then(bucket_objects => {

        return this.deleteObjects(bucket_name, bucket_objects);

      });

    }

    listObjects(bucket_name, continuation_token){

      du.debug('List Objects');

      return new Promise((resolve) => {

        let return_array = [];

        let parameters = {
          Bucket: bucket_name,
          MaxKeys:1000
        };

        if(!_.isUndefined(continuation_token)){
          parameters.ContinuationToken = continuation_token;
        }

        this.s3.listObjectsV2(parameters, (error, data) => {

          if(error){ eu.throwError('server', error); }

          if(_.has(data, 'Contents')){

            return_array = arrayutilities.merge(return_array, data.Contents);

          }

          if(_.has(data, 'IsTruncated') && data.IsTruncated == true && _.has(data, 'NextContinuationToken')){

            return this.listObjects(bucket_name, data.NextContinuationToken).then(more_objects => {

              return_array = arrayutilities.merge(return_array, more_objects);

              return resolve(return_array);

            });

          }else{

            return resolve(return_array);

          }

        });


      });

    }

    deleteObjects(bucket_name, bucket_objects){

      du.debug('Delete Objects');

      return new Promise((resolve) => {

        if(!_.isArray(bucket_objects)){ eu.throwError('server', 'Delete Objects assumes that the bucket objects argument is an array.'); }

        if(bucket_objects.length < 1){

          return resolve(false);

        }

        du.warning(bucket_name+' objects:', bucket_objects);

        let delete_bucket_objects = bucket_objects.map((bucket_object) => {

          if(!_.has(bucket_object, 'Key')){ eu.throwError('server', 'Malformed bucket object.'); }

          return {Key: bucket_object.Key};

        });

        let parameters = {
          Bucket: bucket_name,
          Delete: {
            Objects: delete_bucket_objects,
            Quiet: false
          }
        };

        this.s3.deleteObjects(parameters, (error, data) => {

          du.warning(error, data);

          if (error){
             du.error(error);
             eu.throwError('server', error.message);
          }

          return resolve(data);

        });

      });

    }

    deleteBucket(bucket_name){

      du.debug('Delete Bucket');

      return new Promise((resolve) =>  {

        let parameters = {Bucket: bucket_name};

        this.deleteBucketObjects(bucket_name)
        .then(() => {

          this.s3.deleteBucket(parameters, (error, data) => {

            if(error){
              du.error(error);
              eu.throwError('server', error.message);

            }

            return resolve(data);

          });

        });

      });

    }

    assureBucket(bucket_name){

        du.debug('Assure Bucket');

        return new Promise((resolve, reject) => {

            this.bucketExists(bucket_name).then((result) => {

                if(result !== true){

                    return this.createBucket(bucket_name).then(() => {

                        return resolve(true);

                    }).catch((error) => {

                        du.warning('S3 error (create bucket): ', error);

                        return reject(error);

                    });

                }else{

                    return resolve(true);

                }

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    headBucket(bucket_name){

        du.debug('Head Bucket');

        return new Promise((resolve, reject) => {

            let parameters = {Bucket: bucket_name};

            return this.s3.headBucket(parameters, function(error, data){

                if (error){

                  du.error(error);

                  if(error.code == 'Forbidden'){

                    return resolve(null);

                  }else if(error.code == 'NotFound'){

                    return resolve(null);

                  }else{

                    du.warning('S3 error (head bucket): ', error);

                    return reject(error);

                  }

                }

                return resolve(data);

            });

        });

    }

    putObject(parameters){

        du.debug('Put Object');

        return new Promise((resolve, reject) => {

            if(!_.has(parameters, 'Bucket')){
                return reject('This operation requires a "Bucket" parameter.');
            }

            if(!_.has(parameters, 'Key')){
                return reject('This operation requires a "Key" parameter.');
            }

            this.s3.putObject(parameters, function(error, data){

                if(error){

                    du.warning('S3 error (put object): ', error);

                    return reject(error);

                }

                return resolve(data);

            });

        });

    }

    createBucket(bucket_name){

        du.debug('Create Bucket');

        return new Promise((resolve, reject) => {

            var parameters = {
                Bucket: bucket_name,
            };

            this.s3.createBucket(parameters, function(error, data) {

                if (error) {
                  du.info(parameters);
                    return reject(error);

                }

                return resolve(data);

            });

        });

    }

    getBucketList(use_cache){

      du.debug('Get Bucket List');

      if(_.isUndefined(use_cache)){

        use_cache = true;

      }

      if(_.has(this, 'bucket_list')){

        if(use_cache == true){

          return Promise.resolve(this.bucket_list);

        }

      }

      return this.listBuckets().then((bucket_list) => {

        let processed_bucket_list = bucket_list.Buckets.map(bucket_properties => {return bucket_properties.Name; });

        if(use_cache == true){

          this.bucket_list = processed_bucket_list;

        }

        return processed_bucket_list;

      });

    }

    listBuckets(){

      du.debug('List Buckets');

      return new Promise((resolve) => {

        this.s3.listBuckets((error, data) => {

          if(error){
            du.error(error);
            eu.throwError('server', error.message);
          }

          return resolve(data);

        });

      });

    }

    bucketExists(bucket_name){

      du.debug('Bucket Exists');

      return this.getBucketList().then((bucket_list) => {

        if(_.contains(bucket_list, bucket_name)){

          return true;

        }

        return false;

      });

    }

}

var s3 = new S3Utilities();

module.exports = s3;

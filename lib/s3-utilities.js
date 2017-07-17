'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

class S3Utilities {

    constructor(){

        this.s3 = new AWS.S3({
          apiVersion: '2006-03-01',
          region: 'us-east-1'
        });

    }

    assure_delete(bucket_name){

      du.debug('Assure Delete');

      return new Promise((resolve, reject) => {

        return this.bucket_exists(bucket_name).then((result) => {

          if(result == true){

            return this.delete_bucket(bucket_name).then(() => {

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

    delete_bucket(bucket_name){

      du.debug('Delete Bucket');

      return new Promise((resolve) =>  {

        let parameters = {Bucket: bucket_name};

        this.s3.deleteBucket(parameters, (error, data) => {

          if(error){

            eu.throwError('server', error.message);

          }

          return resolve(data);

        });

      });

    }

    assure_bucket(bucket_name){

        du.debug('Assure Bucket');

        return new Promise((resolve, reject) => {

            this.bucket_exists(bucket_name).then((result) => {

                if(result !== true){

                    return this.create_bucket(bucket_name).then(() => {

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

    head_bucket(bucket_name){

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

    put_object(parameters){

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

    create_bucket(bucket_name){

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

    get_bucket_list(use_cache){

      du.debug('Get Bucket List');

      if(_.isUndefined(use_cache)){

        use_cache = true;

      }

      if(_.has(this, 'bucket_list')){

        if(use_cache == true){

          return Promise.resolve(this.bucket_list);

        }

      }

      return this.list_buckets().then((bucket_list) => {

        let processed_bucket_list = bucket_list.Buckets.map(bucket_properties => {return bucket_properties.Name; });

        if(use_cache == true){

          this.bucket_list = processed_bucket_list;

        }

        return processed_bucket_list;

      });

    }

    list_buckets(){

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

    bucket_exists(bucket_name){

      du.debug('Bucket Exists');

      return this.get_bucket_list().then((bucket_list) => {

        if(_.contains(bucket_list, bucket_name)){

          return true;

        }

        return false;

      });

    }

}

var s3 = new S3Utilities();

module.exports = s3;

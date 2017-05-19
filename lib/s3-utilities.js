'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');

class S3Utilities {

    constructor(stage){

        this.s3 = new AWS.S3();

    }

    assure_bucket(bucket_name){

        return new Promise((resolve, reject) => {

            this.bucket_exists(bucket_name).then((result) => {

                if(result !== true){

                    this.create_bucket(bucket_name)
            .then((result) => {

                return resolve(true);

            })
            .catch((error) => {

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

        return new Promise((resolve, reject) => {

            let parameters = {Bucket: bucket_name};

            this.s3.headBucket(parameters, function(error, data){

                if (error){ return reject(error); }

                return resolve(data);

            });

        });

    }

    put_object(parameters){

        return new Promise((resolve, reject) => {

            if(!_.has(parameters, 'Bucket')){
                return reject('This operation requires a "Bucket" parameter.');
            }

            if(!_.has(parameters, 'Key')){
                return reject('This operation requires a "Key" parameter.');
            }

            this.s3.putObject(parameters, function(error, data){

                if(error){ return reject(error); }

                return resolve(data);

            });

        });

    }

    create_bucket(bucket_name){

        return new Promise((resolve, reject) => {

            var params = {
                Bucket: bucket_name,
            };

            this.s3.createBucket(params, function(error, data) {

                if (error) { return reject(error); }

                return resolve(data);

            });

        });

    }

    bucket_exists(bucket_name){

        return this.head_bucket(bucket_name)
        .then((data) => {
            return true;
        })
        .catch((error) => {
            if(error.code == 'NotFound'){
                return false;
            }
            throw error;
        });

    }

}

var s3 = new S3Utilities();

module.exports = s3;

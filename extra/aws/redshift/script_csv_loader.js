var AWS = require('aws-sdk');
var pg = require('pg');

var s3 = new AWS.S3();
var redshiftClient = require('./redshift.js');

var myBucket = 'sixcrm-redshift-staging';
var myKey = 'test_json_gen.json';

redshiftClient.connect(function(err){
  if(err) throw err;
  else{
    redshiftClient.query("copy f_transactions from 's3://sixcrm-redshift-staging/" + myKey + "' credentials 'aws_access_key_id=AKIAIP6FAI6MVLVAPRWQ;aws_secret_access_key=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' json 'auto' timeformat 'YYYY-MM-DDTHH:MI:SS'",
      function(err, data){
        if(err) throw err;
        else{
          console.log(data);
          redshiftClient.close();
      }
    })
  }
  }
);

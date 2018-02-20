/* eslint-disable no-console */
var redshiftClient = require('./redshift.js');

redshiftClient.connect(function(err){

    var myBucket = 'sixcrm-redshift-staging';
    var myKey = 'test_json_gen.json';

    if(err) {
        return console.error('error fetching client from pool', err);
    }
    redshiftClient.query("copy f_transactions from 's3://"+myBucket+"/"+myKey+"' credentials 'aws_iam_role=arn:aws:iam::068070110666:role/sixcrm_redshift_upload_role' json 'auto' timeformat 'YYYY-MM-DDTHH:MI:SS'"
      , function(err){
          if(err) {
              return console.error('Error running load', err);
          }
          console.log('Success running load');
          redshiftClient.end(function (err) {
              if (err) throw err;
          });
      });
});

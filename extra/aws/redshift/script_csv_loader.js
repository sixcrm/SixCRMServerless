var redshiftClient = require('./redshift.js');

redshiftClient.connect(function(err){

    var myBucket = 'sixcrm-redshift-staging';
    var myKey = 'test_json_gen.json';

    if(err) {
        return console.error('error fetching client from pool', err);
    }
    redshiftClient.query("copy f_transactions from 's3://"+myBucket+"/"+myKey+"' credentials 'aws_access_key_id=AKIAIP6FAI6MVLVAPRWQ;aws_secret_access_key=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' json 'auto' timeformat 'YYYY-MM-DDTHH:MI:SS'"
      , function(err, result){
          if(err) {
              return console.error('Error running load', err);
          }
          console.log('Success running load');
          redshiftClient.end(function (err) {
              if (err) throw err;
          });
      });
});

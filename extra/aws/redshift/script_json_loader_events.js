var redshiftClient = require('./redshift.js');

redshiftClient.connect(function(err){

    var myBucket = 'sixcrm-redshift-staging';
    var myKey = 'test_json_gen_events.json';

    if(err) {
        return console.error('error fetching client from pool', err);
    }
    redshiftClient.query("copy f_events from 's3://"+myBucket+"/"+myKey+"' credentials 'aws_access_key_id=;aws_secret_access_key=' json 'auto' timeformat 'YYYY-MM-DDTHH:MI:SS'"
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

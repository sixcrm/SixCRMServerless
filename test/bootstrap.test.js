const jwt  = require('jsonwebtoken');
const fs   = require('fs');
const yaml = require('js-yaml');
const _    = require("underscore");
var util   = require('util');
var AWS    = require('aws-sdk');



//global.environment = 'local';

// ***HACK:***==============================================================
// This is merely built from the ultimate values in serverless.yml. What we
// want is a utility that reads the serverless.yml file exactly the way the
// serverless environment does, so we have exactly the same values.
process.env = {
    // tables
    'access_keys_table'           : 'localaccess_keys',
    'sessions_table'              : 'localsessions',
    'transactions_table'          : 'localtransactions',
    'rebills_table'               : 'localrebills',
    'customers_table'             : 'localcustomers',
    'products_table'              : 'localproducts',
    'credit_cards_table'          : 'localcredit_cards',
    'users_table'                 : 'localusers',
    'loadbalancers_table'         : 'localloadbalancers',
    'product_schedules_table'     : 'localproduct_schedules',
    'affiliates_table'            : 'localaffiliates',
    'campaigns_table'             : 'localcampaigns',
    'merchant_providers_table'    : 'localmerchant_providers',
    'fulfillment_providers_table' : 'localfulfillment_providers',
    'emails_table'                : 'localemails',
    'smtp_providers_table'        : 'localsmtp_providers',
    'shipping_receipts_table'     : 'localshipping_receipts',

    //queues
    "bill_queue_url"              : 'https://sqs.us-east-1.amazonaws.com/068070110666/development-bill',
    "bill_failed_queue_url"       : 'https://sqs.us-east-1.amazonaws.com/068070110666/development-bill-failed',
    "hold_queue_url"              : 'https://sqs.us-east-1.amazonaws.com/068070110666/development-hold',
    "pending_queue_url"           : 'https://sqs.us-east-1.amazonaws.com/068070110666/development-pending',
    "pending_failed_queue_url"    : 'https://sqs.us-east-1.amazonaws.com/068070110666/development-pending-failed',
    "shipped_queue_url"           : 'https://sqs.us-east-1.amazonaws.com/068070110666/development-shipped',
    "delivered_queue_url"         : 'https://sqs.us-east-1.amazonaws.com/068070110666/development-delivered',
// Wanted in shipProduct worker and forwardMessage worker:    
    //"origin_queue_url"            : 'https://sqs.us-east-1.amazonaws.com/068070110666/development-origin',
    
    // dynamodb configuration
    'endpoint'                    : 'http://localhost:8001',
    'dynamo_endpoint'             : 'http://localhost:8001',
    'transaction_key'             : 'ashdaiuwdaw9d0u197f02ji9ujoja90juahwi',
    'site_key'                    : 'anwdadawdjaklwdlakd',
    'development_bypass'          : 'deathstalker',
    'stage'                       : 'local',

    // this is ignored
    'AWS_PROFILE'                 : 'six',
};


// Seems you need an AWS.Config call, even with bogus credentials. Otherwise,
// AWS will make a remote call through a link-local address (169.254.169.254)
// for metadata. TODO: confirm
var config = new AWS.Config({
    accessKeyId     : 'fake', 
    secretAccessKey : 'fake', 
    region          : 'localhost'
});

before(function(done) {
    
    try {
      var config = yaml.safeLoad(fs.readFileSync('./config/'+global.environment+'/site.yml', 'utf8'));
      global.site_config = config;
      //console.log("global.site_config: ", util.inspect(config,{depth : null}));
    } catch (e) {
      console.log(e);
    }
    
    try{
        global.transaction_jwt = jwt.sign({user_id:'93b086b8-6343-4271-87d6-b2a00149f070'}, global.site_config.jwt.transaction_key);
        global.site_jwt = jwt.sign({user_id:'93b086b8-6343-4271-87d6-b2a00149f070'}, global.site_config.jwt.site_key);
    } catch (e){
        console.log(e);
    }

    done();
  //do some fixture loading etc here    
});

after(function(done) {
    done();
  // here you can clear fixtures, etc.
});

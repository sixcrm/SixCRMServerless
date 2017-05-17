'use strict'
const _ = require('underscore');
const fs = require('fs');
const uuidV4 = require('uuid/v4');
const AWS = require('aws-sdk');
var pg = require('pg');


const du = require('../../../../lib/debug-utilities.js');
const randomutilities = require('../../../../lib/random.js');
const timestamp = require('../../../../lib/timestamp.js');
const s3utilities = require('../../../../lib/s3-utilities.js');
const redshiftutilities =  require('../../../../lib/redshift-utilities.js');

//Technical Debt:  Load the configuration file instead!
process.env.redshift_user = 'admin';
process.env.redshift_database = 'dev';
process.env.redshift_password = 'Jagodica9';
process.env.redshift_host = 'sixcrm-test.ch9ptr45aofu.us-east-1.redshift.amazonaws.com';
process.env.redshift_port = 5439;
process.env.redshift_pool_max = 10;
process.env.redshift_idle_timeout = 30000;

//Technical Debt: Configure this
const s3_bucket = 'sixcrm-redshift-staging';
const s3_key = 'test_json_gen.json';


process.env.SIX_VERBOSE = 2;

//let start_datetime = '2017-05-13T00:47:09.631Z';
//let end_datetime = '2017-05-14T00:47:09.631Z';

let start_datetime = process.argv[2];
let end_datetime = process.argv[3];

//validate the dates

let configuration_object = require('./random-data-configuration.json');

global.output_array = [];

configuration_object.accounts.forEach((account_object) => {

    let new_transaction_count_over_period = rollAccountNewEventCountOverPeriod(start_datetime, end_datetime, account_object);

    du.info('New Transactions over the period:' + new_transaction_count_over_period);

    for(var i = 0; i < new_transaction_count_over_period; i++){

        let datetime        = createDatetimeOverRange(start_datetime, end_datetime);
        let campaign_object = selectCampaign(account_object);
        let affiliate       = selectAffiliate(campaign_object, account_object);
        let subaffiliates   = selectSubAffiliates(campaign_object, account_object);
        let session         = createSession();

        let event = {
            datetime: datetime,
            account: account_object.id,
            session: session,
            campaign: campaign_object.id,
            affiliate: affiliate,
            subffiliate_1: subaffiliates.subaffiliate_1,
            subffiliate_2: subaffiliates.subaffiliate_2,
            subffiliate_3: subaffiliates.subaffiliate_3,
            subffiliate_4: subaffiliates.subaffiliate_4,
            subffiliate_5: subaffiliates.subaffiliate_5,
        };

        addEvent('click', event, account_object);

    }

});

let s3_file_body = createS3File();

pushToS3(s3_file_body, s3_bucket, s3_key).then(() => executeIngest(s3_bucket, s3_key));

//Functions!
function addEvent(event_type, event_object, account_object){

    if(randomutilities.randomProbability(account_object.spoofing_config.event_probabilities[event_type])){

        event_object.type = event_type;
        event_object = updateEventTimestamp(event_type, event_object);

        pushObject(event_object);

        switch(event_type){

        case 'click':

            addEvent('lead', event_object, account_object);

            break;

        case 'lead':

            addEvent('order', event_object, account_object);

            break;

        case 'order':

            addEvent('upsell', event_object, account_object);
            addEvent('confirm', event_object, account_object);

            break;

        case 'upsell':
            addEvent('upsell2', event_object, account_object);
            break;

        case 'upsell2':
        case 'confirm':
        default:
            break;

        }

    }

}

function executeIngest(s3_bucket, s3_key){

    du.debug('Execute Ingest');

  //let redshiftClient = createRedshiftClient();

  //Technical Debt:  Totally insecure.  Configure credentials!
    let query = `COPY f_events FROM 's3://${s3_bucket}/${s3_key}' CREDENTIALS 'aws_access_key_id=AKIAIP6FAI6MVLVAPRWQ;aws_secret_access_key=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' MANIFEST json 'auto' timeformat 'YYYY-MM-DDTHH:MI:SS'`;

    return redshiftutilities.query(query, [])
  .then((results) => {
      du.info('Successfully loaded data to Redshift');
  }).catch((error) => {
      throw error;
  });

}

function pushToS3(file_body, s3_bucket, s3_key){

    du.debug('Push to S3');

    return s3utilities.bucket_exists(s3_bucket)
  .then(() => {

      let parameters = {Bucket: s3_bucket, Key: s3_key, Body: file_body};

      return s3utilities.put_object(parameters)
    .then(() => {
        du.output("Successfully uploaded data to "+s3_bucket+"/"+s3_key);
        return true;
    })
    .catch((error) => {
        throw error;
    });

  })
  .catch((error) => {
      throw error;
  });

}

//FINISH!
function pushObject(event_object){

    global.output_array.push(JSON.stringify(event_object));

}

function createS3File(){

    return global.output_array.join("\n");

}

//looks OK
function updateEventTimestamp(event_type, event_object){

    if(event_type !== 'click'){

        let additional_seconds = Math.round(randomutilities.randomGaussian(20, 5));

        let new_timestamp = timestamp.dateToTimestamp(event_object.datetime) + additional_seconds;

        event_object['datetime'] = timestamp.toISO8601(new_timestamp);

    }

    return event_object;

}

// looks OK
function createSession(){
    return uuidV4();
}

//looks ok
function selectCampaign(account_object){

    return randomutilities.selectRandomFromArray(account_object.campaigns);

}

//looks ok
function selectAffiliate(campaign_object, account_object){

    if(randomutilities.randomProbability(account_object.spoofing_config.affiliate_probabilities.affiliate_probability)){

        return randomutilities.selectRandomFromArray(campaign_object.affiliates);

    }else{

        return null;

    }

}

//looks ok
function selectSubAffiliate(name, subaffiliate_array, account_object){

    if(randomutilities.randomProbability(account_object.spoofing_config.affiliate_probabilities[name+'_probability'])){

        //du.warning(subaffiliate_array);
        return randomutilities.selectRandomFromArray(subaffiliate_array);

    }else{

        return null;

    }

}

//looks ok
function selectSubAffiliates(campaign_object, account_object){

    let return_object = {};

    for(var k in campaign_object.subaffiliates){
        return_object[k] = selectSubAffiliate(k, campaign_object.subaffiliates[k], account_object);
    }

    return return_object;

}

//looks good
function createDatetimeOverRange(start_time, end_time){

    let start_time_seconds = timestamp.dateToTimestamp(start_datetime);
    let end_time_seconds = timestamp.dateToTimestamp(end_datetime);

    let period_length = end_time_seconds - start_time_seconds;

    let random_uniform_scalar = randomutilities.randomDouble(0, 1, 5);

    let new_timestamp = ((period_length) * random_uniform_scalar) + start_time_seconds;

    return timestamp.convertToISO8601(timestamp.secondsToDate(new_timestamp));

}

//looks good
function rollAccountEventCountOverPeriod(start_datetime, end_datetime, account_object){

    let random_roll = randomutilities.randomGaussian(account_object.spoofing_config.monthly_transactions.mean, account_object.spoofing_config.monthly_transactions.standard_deviation);

    let period_scalar = (timestamp.dateToTimestamp(end_datetime) - timestamp.dateToTimestamp(start_datetime))/(3600 * 24 * 31);

    return Math.round((period_scalar * random_roll));

}

//looks good
function rollAccountNewEventCountOverPeriod(start_datetime, end_datetime, account_object){

    let event_count = rollAccountEventCountOverPeriod(start_datetime, end_datetime, account_object);

    return Math.round(event_count * account_object.spoofing_config.monthly_transactions.new);

}

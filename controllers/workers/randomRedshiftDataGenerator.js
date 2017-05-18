'use strict'
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

const du = global.routes.include('lib', 'debug-utilities.js');
const randomutilities = global.routes.include('lib', 'random.js');
const timestamp = global.routes.include('lib', 'timestamp.js');
const s3utilities = global.routes.include('lib', 's3-utilities.js');
const redshiftutilities =  global.routes.include('lib', 'redshift-utilities.js');
const workerController = global.routes.include('controllers', 'workers/worker.js');

class RandomRedshiftData extends workerController {

    constructor(){

        super();

    }

    execute(){

        return this.acquireConfiguration()
    .then(() => this.buildObjects())
    .then(() => this.createS3Files())
    .then(() => this.pushToS3())
    .then(() => this.executeIngest())
    .then(() => this.feedback());

    }

    feedback(){

    //diagnostic info here pleez...

        du.highlight('Process complete');

        return true;

    }

    buildObjects(){

        let execution_window = this.setExecutionWindow();

        this.configuration_object.accounts.forEach((account_object) => {

            let parameters = {
                start_datetime: execution_window.start_datetime,
                end_datetime: execution_window.end_datetime,
                account: account_object,
            };

            this.generateObjects(parameters);

        });

        return Promise.resolve(true);

    }

    generateObjects(parameters){

        let new_transaction_count_over_period = this.rollAccountNewEventCountOverPeriod(parameters);

        for(var i = 0; i < new_transaction_count_over_period; i++){

            var event_object = this.createEventObject(parameters);

            this.addEvent('click', event_object, parameters.account);

        }

    }

    createEventObject(parameters){

        let datetime          = this.createDatetimeOverRange(parameters.start_datetime, parameters.end_datetime);
        let campaign_object   = this.selectCampaign(parameters.account);
        let affiliate         = this.selectAffiliate(campaign_object, parameters.account);
        let subaffiliates     = this.selectSubAffiliates(campaign_object, parameters.account);
        let session           = this.createSession();

        let account_id        = parameters.account.id;
        let campaign_id       = campaign_object.id;

        return {
            session: session,
            type: '',
            datetime: datetime,
            account: account_id,
            campaign: campaign_id,
            product_schedule: null,
            affiliate: affiliate,
            subffiliate_1: subaffiliates.subaffiliate_1,
            subffiliate_2: subaffiliates.subaffiliate_2,
            subffiliate_3: subaffiliates.subaffiliate_3,
            subffiliate_4: subaffiliates.subaffiliate_4,
            subffiliate_5: subaffiliates.subaffiliate_5,
        };

    }

    setExecutionWindow(){

        let now = timestamp.getISO8601();
        let now_sub_interval = timestamp.toISO8601(timestamp.getTimeDifference(this.random_data_interval));

        return {
            start_datetime: now,
            end_datetime: now_sub_interval
        }

    }

    acquireConfiguration(){

        this.acquireConfigurationObject();

        this.random_data_interval = process.env.redshift_random_data_interval;
        this.s3_bucket = process.env.redshift_random_data_staging_bucket;

        return Promise.resolve(true);

    }

    acquireConfigurationObject(){

        return this.configuration_object = global.routes.include('config', process.env.stage+'/random-redshift-data-configuration.json');

    }

    addEvent(event_type, event_object, account_object){

        if(randomutilities.randomProbability(account_object.spoofing_config.event_probabilities[event_type])){

            event_object = this.updateEventObject(event_object, event_type);

            this.pushObject(event_object, 'events');

            switch(event_type){

            case 'click':

                this.addEvent('lead', event_object, account_object);

                break;

            case 'lead':

                this.addEvent('order', event_object, account_object);

                break;

            case 'order':

                this.addEvent('upsell', event_object, account_object);
                this.addEvent('confirm', event_object, account_object);

                break;

            case 'upsell':

                this.addEvent('upsell2', event_object, account_object);
                break;

            case 'upsell2':
            case 'confirm':
            default:
                break;

            }

        }

    }

    updateEventObject(event_object, event_type){

        event_object['type'] = event_type;
        event_object['product_schedule'] = this.selectProductSchedule(event_type, event_object.account, event_object.campaign);
        event_object = this.updateEventTimestamp(event_type, event_object);

        return event_object;

    }

    executeIngest(){

        du.debug('Execute Ingest');

        let promises = [];

        for(var k in this.s3_files){

            var s3_filename = this.getS3FileName(k);
            let query = `COPY f_events FROM 's3://${this.s3_bucket}/${s3_filename}' MANIFEST json 'auto' timeformat 'YYYY-MM-DDTHH:MI:SS'`;

            promises.push(redshiftutilities.query(query, [])
        .then((results) => {
            du.info('Successfully loaded data to Redshift');
        }).catch((error) => {
            throw error;
        }));

        }

        return Promise.all(promises);

    }

    getS3FileName(file_key){
        return file_key+'.json';
    }

    pushToS3(file_body){

        du.debug('Push to S3');

        return s3utilities.bucket_exists(this.s3_bucket)
    .then(() => {

        let promises = [];

        for(var k in this.s3_files){

            var parameters = {
                Bucket: this.s3_bucket,
                Key: this.getS3FileName(k),
                Body: this.s3_files[k]
            };

            promises.push(s3utilities.put_object(parameters));

        }

        return Promise.all(promises);

    })
    .then((promises) => {

        du.output("Successfully uploaded data to S3");

        return true;

    })
    .catch((error) => {
        throw error;
    });

    }

    pushObject(object, list){

      //expensive, but cleaner.
        if(!_.has(this, list+'_output_array')){
            this[list+'_output_array'] = [];
        }

        this[list+'_output_array'].push(JSON.stringify(object));

    }

    createS3Files(){

        let promises = [];

        promises.push(this.createS3File('events'));
    //promises.push(this.createS3File('transactions'));
    //promises.push(this.createS3File('activity'));

        return Promise.all(promises).then((promises) => {

            this.s3_files = {
                events: promises[0],
        //transactions: '',
        //activity: ''
            };

            return true;

        });

    }

    createS3File(list){

        if(_.has(this, list+'_output_array') && _.isArray(this[list+'_output_array']) && this[list+'_output_array'].length > 0){

            return Promise.resolve(this[list+'_output_array'].join("\n"));

        }else{

            return Promise.reject(new Error('"'+list+'_output_array" doesn\'t exist'));

        }

    }

    updateEventTimestamp(event_type, event_object){

        if(event_type !== 'click'){

            let additional_seconds = Math.round(randomutilities.randomGaussian(20, 5));

            let new_timestamp = timestamp.dateToTimestamp(event_object.datetime) + additional_seconds;

            event_object['datetime'] = timestamp.toISO8601(new_timestamp);

        }

        return event_object;

    }

    createSession(){
        return uuidV4();
    }

    selectCampaign(account_object){

        return randomutilities.selectRandomFromArray(account_object.campaigns);

    }

    selectProductSchedule(event_type, account_id, campaign_id){

        let campaign_object = this.getCampaignObject(account_id, campaign_id);

        if(_.has(campaign_object.product_schedule, event_type)){

            return campaign_object.product_schedule[event_type];

        }

        return null;

    }

    getCampaignObject(account_id, campaign_id){

        let accounts = this.configuration_object.accounts;

        accounts.forEach((account) => {

            if(account_id == account.id){

                let campaigns = account.campaigns;

                campaigns.forEach((campaign) => {

                    if(campaign.id == campaign_id){

                        return campaign;

                    }

                });

            }

        });

        return null;

    }

    selectAffiliate(campaign_object, account_object){

        if(randomutilities.randomProbability(account_object.spoofing_config.affiliate_probabilities.affiliate_probability)){

            return randomutilities.selectRandomFromArray(campaign_object.affiliates);

        }else{

            return null;

        }

    }

    selectSubAffiliate(name, subaffiliate_array, account_object){

        if(randomutilities.randomProbability(account_object.spoofing_config.affiliate_probabilities[name+'_probability'])){

          //du.warning(subaffiliate_array);
            return randomutilities.selectRandomFromArray(subaffiliate_array);

        }else{

            return null;

        }

    }

    selectSubAffiliates(campaign_object, account_object){

        let return_object = {};

        for(var k in campaign_object.subaffiliates){
            return_object[k] = this.selectSubAffiliate(k, campaign_object.subaffiliates[k], account_object);
        }

        return return_object;

    }

    createDatetimeOverRange(start_datetime, end_datetime){

        let start_time_seconds = timestamp.dateToTimestamp(start_datetime);
        let end_time_seconds = timestamp.dateToTimestamp(end_datetime);

        let period_length = end_time_seconds - start_time_seconds;

        let random_uniform_scalar = randomutilities.randomDouble(0, 1, 5);

        let new_timestamp = ((period_length) * random_uniform_scalar) + start_time_seconds;

        return timestamp.convertToISO8601(timestamp.secondsToDate(new_timestamp));

    }

    rollAccountEventCountOverPeriod(start_datetime, end_datetime, account_object){

        let random_roll = randomutilities.randomGaussian(account_object.spoofing_config.monthly_transactions.mean, account_object.spoofing_config.monthly_transactions.standard_deviation);

        let period_scalar = (timestamp.dateToTimestamp(end_datetime) - timestamp.dateToTimestamp(start_datetime))/(3600 * 24 * 31);

        return Math.round((period_scalar * random_roll));

    }

    rollAccountNewEventCountOverPeriod(start_datetime, end_datetime, account_object){

        let event_count = this.rollAccountEventCountOverPeriod(start_datetime, end_datetime, account_object);

        return Math.round(event_count * account_object.spoofing_config.monthly_transactions.new);

    }

}

module.exports = new RandomRedshiftData();

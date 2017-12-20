'use strict'
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

//Fix Product Schedule.
//Test!

class RandomRedshiftData extends workerController {

    constructor(){

        super();

        this.event_to_transaction = [
            'session',
            'datetime',
            'account',
            'campaign',
            'product_schedule',
            'affiliate',
            'subaffiliate_1',
            'subaffiliate_2',
            'subaffiliate_3',
            'subaffiliate_4',
            'subaffiliate_5'
        ];

        this.table_name_translations = {
            transactions: 'f_transactions',
            events: 'f_events',
            activity: 'f_activity'
        };

        this.redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

    }

    set(key, value){
        this[key] = value;
    }

    execute(){

        return this.acquireConfiguration()
        .then(() => this.validateConfiguration())
        .then(() => this.buildObjects())
        .then(() => this.createS3Files())
        .then(() => this.pushToS3())
        .then(() => this.executeIngest())
        .then(() => this.feedback());

    }

    feedback(){

        du.debug('Feedback');

        //du.highlight('Process complete');

        return Promise.resolve('New data uploaded.');

    }

    validateConfiguration(){

        du.debug('Validate Configuration');

        if(_.has(this, 'start_datetime') || _.has(this, 'end_datetime')){

            if(!_.has(this, 'start_datetime') || !_.has(this, 'end_datetime')){

                return Promise.reject(eu.getError('validation','Invalid datetime fields -  both start and end are required if any one of them is provided.'));

            }

            if(!timestamp.isISO8601(this.start_datetime) || !timestamp.isISO8601(this.end_datetime)){

                return Promise.reject(eu.getError('validation','Invalid datetimes -  the start and end datetimes must be ISO8601 format compliant.'));

            }

            if(this.start_datetime > this.end_datetime){

                return Promise.reject(eu.getError('validation','Invalid datetimes -  the start datetime must be less than or equal to the end datetime.'));

            }

        }

        return Promise.resolve(true);

    }

    buildObjects(){

        du.debug('Build Objects');

        let execution_window = this.setExecutionWindow();

        this.configuration_object.accounts.forEach((account_object) => {

            let parameters = {
                start_datetime: execution_window.start_datetime,
                end_datetime: execution_window.end_datetime,
                account: account_object,
            };

            this.generateObjects(parameters);

        });

        du.output(this.events_output_array);

        return Promise.resolve(true);

    }

    generateObjects(parameters){

        du.debug('Generate Objects');

        let new_transaction_count_over_period = Math.round(this.rollAccountNewEventCountOverPeriod(parameters));

        du.highlight('New Event Count: '+ new_transaction_count_over_period);

        for(var i = 0; i < new_transaction_count_over_period; i++){

            this.setSession();

            var event_object = this.createEventObject(parameters);

            this.addEvent('click', event_object, parameters.account);

        }

    }

    createEventObject(parameters){

        du.debug('Create Event Object');

        let datetime          = this.createDatetimeOverRange(parameters.start_datetime, parameters.end_datetime);
        let campaign_object   = this.selectCampaign(parameters.account);
        let affiliate         = this.selectAffiliate(campaign_object, parameters.account);
        let subaffiliates     = this.selectSubAffiliates(campaign_object, parameters.account);

        let session           = this.session.id;

        let account_id        = parameters.account.id;
        let campaign_id       = campaign_object.id;

        return {
            session: session,
            type: '',
            datetime: datetime,
            account: account_id,
            campaign: campaign_id,
            product_schedule: '',
            affiliate: affiliate,
            subaffiliate_1: subaffiliates.subaffiliate_1,
            subaffiliate_2: subaffiliates.subaffiliate_2,
            subaffiliate_3: subaffiliates.subaffiliate_3,
            subaffiliate_4: subaffiliates.subaffiliate_4,
            subaffiliate_5: subaffiliates.subaffiliate_5,
        };

    }

    setExecutionWindow(){

        du.debug('Set Execution Window');

        let now, proposed_start_time;

        if(_.has(this, 'start_datetime') && _.has(this, 'end_datetime')){

            now = timestamp.convertToISO8601(this.end_datetime);
            proposed_start_time = timestamp.convertToISO8601(this.start_datetime);

        }else{

            now = timestamp.createTimestampSeconds();
            proposed_start_time = timestamp.toISO8601(now  - this.random_data_interval);
            now = timestamp.toISO8601(now);

            du.highlight('Proposed Start Time: '+proposed_start_time);
            du.highlight('Data Interval: '+this.random_data_interval);
            du.highlight('End Time: '+now);

        }

        let execution_window = {
            start_datetime: proposed_start_time,
            end_datetime: now
        };

        du.highlight('Execution Window: ', execution_window);

        return execution_window;

    }

    acquireConfiguration(){

        du.debug('Acquire Configuration');

        this.acquireConfigurationObject();

        this.random_data_interval = process.env.redshift_random_data_interval;
        this.s3_bucket = 'sixcrm-'+process.env.stage+'-random-generator';

        return Promise.resolve(true);

    }

    acquireConfigurationObject(){

        du.debug('Acquire Configuration Object');

        return this.configuration_object = global.SixCRM.routes.include('config', process.env.stage+'/random-redshift-data-configuration.json');

    }

    addEvent(event_type, event_object, account_object){

        du.debug('Add Event');

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


                this.addTransaction('order', event_object, account_object);

                this.addEvent('upsell', event_object, account_object);
                this.addEvent('confirm', event_object, account_object);

                break;

            case 'upsell':

                this.addTransaction('upsell', event_object, account_object);
                this.addEvent('upsell2', event_object, account_object);

                break;

            case 'upsell2':

                this.addTransaction('upsell2', event_object, account_object);
                break;

            case 'confirm':
            default:
                break;

            }

        }

    }

    addTransaction(event_type, event_object, account_object){

        du.debug('Add Transaction');

        let transaction_object = this.createTransactionObject(event_type, event_object, account_object);

        this.pushObject(transaction_object, 'transactions');


    }

    setSession(){

        this.session = {
            id: uuidV4()
        }

    }

    updateSession(property, value){

        this.session[property] = value;

    }

    createTransactionObject(event_type, event_object, account_object){

        du.debug('Create Transaction Object');

        let transaction = {
            id: uuidV4(),
            datetime: "",
            customer: "",
            creditcard: "",
            merchant_provider:"",
            campaign:"",
            affiliate:"",
            amount:"",
            processor_result:"",
            account:"",
            type:"",
            subtype:"",
            product_schedule:"",
            subaffiliate_1:"",
            subaffiliate_2:"",
            subaffiliate_3:"",
            subaffiliate_4:"",
            subaffiliate_5:"",
            prepaid:"",
            result:"",
            associated_transaction:""
        };

        for(var j in transaction){
            if(_.has(event_object, j) && _.contains(this.event_to_transaction, j)){
                transaction[j] = event_object[j];
            }
        }

        transaction.customer = this.getCustomer();
        transaction.creditcard = this.getCreditCard();
        transaction.merchant_provider = this.selectMerchantProvider(event_object, account_object);
        transaction.amount = this.getAmountFromProductSchedule(event_type, event_object, account_object);

        transaction.processor_result = 'success';
        transaction.type = 'new';
        transaction.subtype = event_type;

        return transaction;

    }

    assureSessionField(field){

        du.debug('Assure Session Field');

        if(_.has(this, 'session') && _.has(this.session, field)){

            return this.session[field];

        }

        let new_field_id = uuidV4();

        this.updateSession(field, new_field_id);

        return this.session[field];

    }

    //test
    getCustomer(){

        du.debug('Get Customer');

        return this.assureSessionField('customer');

    }

    //test
    getCreditCard(){

        du.debug('Get Credit Card');

        return this.assureSessionField('creditcard');

    }

    //test
    selectMerchantProvider(event_object, account_object){

        du.debug('Select Merchant Provider');

        if(_.has(this, 'session') && _.has(this.session, 'merchant_provider')){

            du.debug('Merchant Provider in session: ', this.session);

            return this.session.merchant_provider;

        }


        let campaign_object = this.getCampaignObject(account_object.id, event_object.campaign);

        if(_.has(campaign_object, 'merchant_providers') && _.isArray(campaign_object.merchant_providers) && campaign_object.merchant_providers.length > 0){

            this.session.merchant_provider = randomutilities.selectRandomFromArray(campaign_object.merchant_providers);

        }

        return this.session.merchant_provider;

    }

    getAmountFromProductSchedule(event_type, event_object, account_object){

        du.debug('Get Amount From Product Schedule');

        let product_schedule_id = null;

        if(_.has(event_object, 'product_schedule')){

            product_schedule_id = event_object.product_schedule;

            let campaign_object = this.getCampaignObject(account_object.id, event_object.campaign);

            let product_schedule_object = this.getProductScheduleObject(campaign_object, product_schedule_id);

            if(_.has(product_schedule_object, 'amount')){

                return product_schedule_object.amount;

            }else{

                eu.throwError('validation','Amount not defined for product schedule obect.');

            }

        }

        eu.throwError('validation','No product schedule in the event object');

    }

    //test
    getProductScheduleObject(campaign_object, product_schedule_id){

        du.debug('Get Product Schedule');

        if(_.has(campaign_object, 'product_schedules')){
            for(var m in campaign_object.product_schedules){
                if(_.has(campaign_object.product_schedules[m], 'id') && (campaign_object.product_schedules[m].id == product_schedule_id)){
                    return campaign_object.product_schedules[m];
                }
            }
        }

        eu.throwError('validation','No product schedule defined for the campaign object');

    }

    updateEventObject(event_object, event_type){

        du.debug('Update Event Object');

        event_object['type'] = event_type;
        event_object['product_schedule'] = this.selectProductSchedule(event_type, event_object.account, event_object.campaign);
        event_object = this.updateEventTimestamp(event_type, event_object);

        return event_object;

    }

    getRedshiftTableName(row_type){

        return this.table_name_translations[row_type];

    }

    executeIngest(){

        du.debug('Execute Ingest');

        let queries = [];

        for(var k in this.s3_files){

            var s3_filename = this.getS3FileName(k);
            var table_name = this.getRedshiftTableName(k)

            let aws_account_id = global.SixCRM.configuration.getAccountIdentifier();

            queries.push(
                `COPY ${table_name}
                FROM 's3://${this.s3_bucket}/${s3_filename}'
                credentials 'aws_iam_role=arn:aws:iam::${aws_account_id}:role/sixcrm_redshift_copy_role'
                json 'auto'
                timeformat 'YYYY-MM-DDTHH:MI:SS'`);

        }

        let query = queries.join('; ');

        return this.redshiftqueryutilities.query(query, []);

    }

    getS3FileName(file_key){

        du.debug('Get S3 Filename');

        return file_key+'.json';

    }

    pushToS3(file_body){

        du.debug('Push to S3');

        return s3utilities.assureBucket(this.s3_bucket)
        .then(() => {

            let promises = [];

            for(var k in this.s3_files){

                var parameters = {
                    Bucket: this.s3_bucket,
                    Key: this.getS3FileName(k),
                    Body: this.s3_files[k]
                };

                promises.push(s3utilities.putObject(parameters));

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

        du.debug(object);

        du.debug('Push Object');
      //expensive, but cleaner.
        if(!_.has(this, list+'_output_array')){
            this[list+'_output_array'] = [];
        }

        this[list+'_output_array'].push(JSON.stringify(object));

    }

    createS3Files(){

        du.debug('Create S3 Files');

        let promises = [];

        promises.push(this.createS3File('events'));
        promises.push(this.createS3File('transactions'));
    //promises.push(this.createS3File('activity'));

        return Promise.all(promises).then((promises) => {

            let events_file_body = promises[0];
            let transactions_file_body = promises[1];

            this.s3_files = {
                events: events_file_body,
            };

            if(_.isString(transactions_file_body)){
                this.s3_files['transactions'] = transactions_file_body;
            }

            return true;

        });

    }

    createS3File(list){

        du.debug('Create S3 File');

        if(_.has(this, list+'_output_array') && _.isArray(this[list+'_output_array']) && this[list+'_output_array'].length > 0){

            du.info(this[list+'_output_array']);

            return Promise.resolve(this[list+'_output_array'].join("\r"));

        }else{

            return Promise.resolve('');

        }

    }

    updateEventTimestamp(event_type, event_object){

        du.debug('Update Event Timestamp');

        if(event_type !== 'click'){

            let additional_seconds = Math.round(randomutilities.randomGaussian(20, 5));

            let new_timestamp = timestamp.dateToTimestamp(event_object.datetime) + additional_seconds;

            event_object['datetime'] = timestamp.toISO8601(new_timestamp);

        }

        return event_object;

    }

    selectCampaign(account_object){

        du.debug('Select Campaign');

        return randomutilities.selectRandomFromArray(account_object.campaigns);

    }

    selectProductSchedule(event_type, account_id, campaign_id){

        du.debug('Select Product Schedule');

        let campaign_object = this.getCampaignObject(account_id, campaign_id);

        if(_.has(campaign_object.product_schedules, event_type) && _.has(campaign_object.product_schedules[event_type], 'id')){

            return campaign_object.product_schedules[event_type].id;

        }

        return "";

    }

    getCampaignObject(account_id, campaign_id){

        du.debug('Get Campaign Object');

        let accounts = this.configuration_object.accounts;

        let found_campaign = null;

        accounts.forEach((account) => {

            if(account_id == account.id){

                let campaigns = account.campaigns;

                campaigns.forEach((campaign) => {

                    if(campaign.id == campaign_id){

                        found_campaign = campaign;

                    }

                });

            }

        });

        return found_campaign;

    }

    selectAffiliate(campaign_object, account_object){

        du.debug('Select Affiliate');

        if(randomutilities.randomProbability(account_object.spoofing_config.affiliate_probabilities.affiliate_probability)){

            return randomutilities.selectRandomFromArray(campaign_object.affiliates);

        }else{

            return "";

        }

    }

    selectSubAffiliate(name, subaffiliate_array, account_object){

        du.debug('Select Subaffiliate');

        if(randomutilities.randomProbability(account_object.spoofing_config.affiliate_probabilities[name+'_probability'])){

          //du.warning(subaffiliate_array);
            return randomutilities.selectRandomFromArray(subaffiliate_array);

        }else{

            return "";

        }

    }

    selectSubAffiliates(campaign_object, account_object){

        du.debug('Select Subaffiliates');

        let return_object = {};

        for(var k in campaign_object.subaffiliates){
            return_object[k] = this.selectSubAffiliate(k, campaign_object.subaffiliates[k], account_object);
        }

        return return_object;

    }

    createDatetimeOverRange(start_datetime, end_datetime){

        du.debug('Select Create Datetime Over Range');

        let start_time_seconds = timestamp.dateToTimestamp(start_datetime);
        let end_time_seconds = timestamp.dateToTimestamp(end_datetime);

        let period_length = end_time_seconds - start_time_seconds;

        let random_uniform_scalar = randomutilities.randomDouble(0, 1, 5);

        let new_timestamp = ((period_length) * random_uniform_scalar) + start_time_seconds;

        return timestamp.convertToISO8601(timestamp.secondsToDate(new_timestamp));

    }

    rollAccountEventCountOverPeriod(parameters){

        du.debug('Roll Account Event Count Over Period');

        let new_transaction_count = this.rollNewTransactionCountOverPeriod(parameters);

        let event_count = this.getEventCountFromNewTransactionCount(parameters, new_transaction_count);

        return event_count;

    }

    rollNewTransactionCountOverPeriod(parameters){

        du.debug('Roll New Transaction Count Over Period');

        let transaction_random_roll = this.rollTransactionCountOverPeriod(parameters);
        let period_scalar = this.getPeriodScalar(parameters);

        let transaction_count_over_period = (period_scalar * transaction_random_roll);

        du.info('Transaction Count Over Period: '+transaction_count_over_period);

        let new_transaction_count_over_period = (parseFloat(parameters.account.spoofing_config.monthly_transactions.new) * transaction_count_over_period);

        du.info('New Transaction Count Over Period: '+new_transaction_count_over_period);

        return new_transaction_count_over_period;

    }

    getPeriodScalar(parameters){

        du.debug('Get Period Scalar');

        let period_scalar = (timestamp.dateToTimestamp(parameters.end_datetime) - timestamp.dateToTimestamp(parameters.start_datetime))/(3600 * 24 * 31);

        du.info('Percentage of the month: '+mathutilities.formatToPercentage(period_scalar, 8)+'%');
        return period_scalar;

    }

    rollTransactionCountOverPeriod(parameters){

        du.debug('Roll Transaction Count Over Period');

        let transaction_random_roll = randomutilities.randomGaussian(
        parameters.account.spoofing_config.monthly_transactions.mean,
        parameters.account.spoofing_config.monthly_transactions.standard_deviation
      );

        du.info('Total Transaction Count (Gaussian): '+ transaction_random_roll);

        return transaction_random_roll;

    }

    getEventCountFromNewTransactionCount(parameters, transaction_count){

        du.debug('Get Event Count From New Transaction Count');

        let sum_upsell_probability = parseFloat(parameters.account.spoofing_config.event_probabilities.upsell) + parseFloat(parameters.account.spoofing_config.event_probabilities.upsell2);

        du.info('Sum Upsell Probability: '+sum_upsell_probability);

        let order_count = (transaction_count / (1 + sum_upsell_probability));

        du.info('Order Count: '+order_count);

        let clicks_to_orders_compound_probability = (parseFloat(parameters.account.spoofing_config.event_probabilities.lead) * parseFloat(parameters.account.spoofing_config.event_probabilities.order));

        du.info('Clicks to orders compound probability: '+clicks_to_orders_compound_probability);

        let click_count = (order_count / clicks_to_orders_compound_probability);

        du.info('Click Count (Event Count): '+ click_count);

        return click_count;

    }

    rollAccountNewEventCountOverPeriod(parameters){

        du.debug('Roll Account New Event Count Over Period');

        let event_count = this.rollAccountEventCountOverPeriod(parameters);

        du.debug('Event Count: '+event_count);

        return event_count;

    }

}

module.exports = new RandomRedshiftData();

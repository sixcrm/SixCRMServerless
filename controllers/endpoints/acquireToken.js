'use strict';
const jwt = require('jsonwebtoken');
const _ = require("underscore");
const validator = require('validator');
const Validator = require('jsonschema').Validator;

const timestamp = global.routes.include('lib', 'timestamp.js');
const du = global.routes.include('lib', 'debug-utilities.js');

const endpointController = global.routes.include('controllers', 'endpoints/endpoint.js');
const campaignController = global.routes.include('controllers', 'entities/Campaign');

class acquireTokenController extends endpointController {

    constructor(){
        super({
            required_permissions: [
                'user/read',
                'account/read',
                'campaign/read',
                'affiliate/read',
                'affiliate/create'
            ]
        });

    }

    execute(event){

        return this.preprocessing(event)
      .then((event) => this.acquireBody(event))
      .then((event) => this.validateInput(event))
      .then((event) => this.validateCampaign(event))
      .then((event) => this.handleAffiliateInformation(event))
      .then((event) => this.pushToRedshift(event))
			.then((event) => this.acquireToken(event));

    }

    acquireBody(event){

        du.debug('Acquire Body');

        var duplicate_body;

        try {
            duplicate_body = JSON.parse(event['body']);
        } catch (e) {
            duplicate_body = event.body;
        }

        return Promise.resolve(duplicate_body);

    }

    validateInput(event){

        du.debug('Validate Input');

        return new Promise((resolve, reject) => {

            var acquire_token_schema;
            var affiliates_schema;

            try{

                acquire_token_schema = global.routes.include('model', 'endpoints/token');
                affiliates_schema = global.routes.include('model', 'endpoints/affiliates');

            } catch(e){

                return reject(new Error('Unable to load validation schemas.'));

            }

            var validation;
            var params = JSON.parse(JSON.stringify(event || {}));

            try{
                var v = new Validator();

                v.addSchema(affiliates_schema, '/Affiliates');
                validation = v.validate(params, acquire_token_schema);

            }catch(e){
                du.warning(e);
                return reject(new Error('Unable to instantiate validator.'));
            }

            if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

                du.warning(validation);

                var error = {
                    message: 'One or more validation errors occurred.',
                    issues: validation.errors.map((e)=>{ return e.message; })
                };

                return reject(error);

            }

            return resolve(params)

        });

    }

    validateCampaign(event){

        return campaignController.get(event.campaign).then((campaign) => {

            if(!_.has(campaign, 'id')){ throw new Error('Invalid Campaign ID: '+event.campaign); }

            return event;

        });

    }

    createEventObject(event){

        du.debug('Create Event Object');

        let event_object = {
            session: '',
            type : 'click',
            datetime: timestamp.getISO8601(),
            account: global.account,
            campaign: event.campaign,
            product_schedule: ''
        };

        ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5'].forEach((optional_property) => {
            if(_.has(event, 'affiliates') && _.has(event.affiliates, optional_property) && !_.isNull(event.affiliates[optional_property])){
                event_object[optional_property] = event.affiliates[optional_property];
            }else{
                event_object[optional_property] = '';
            }
        });

        return event_object;

    }

    pushToRedshift(event){

        du.debug('Push To Redshift');

        let event_object = this.createEventObject(event);

        return this.pushRecordToRedshift('events', event_object).then((result) => {

            return event;

        });

    }

    acquireToken (event) {

        du.debug('Acquire Token');

		//Note:  The presence of this has already been assured in the endpoint.js class in the preprocessing event
        let user_alias = global.user.alias;

		//Note: The transaction JWT is only valid for one hour
        let _timestamp = timestamp.createTimestampSeconds() + (60 * 60);

		//Technical Debt:  we want the account in the JWT too...
        let payload = {
            iat: _timestamp,
            exp: _timestamp,
            user_alias: user_alias
        }

        let transaction_jwt = jwt.sign(payload, process.env.transaction_secret_key);

        return Promise.resolve(transaction_jwt);

    }

}

module.exports = new acquireTokenController();

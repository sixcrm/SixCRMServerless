'use strict';
const _ = require("underscore");
const jwt = require('jsonwebtoken');
const Validator = require('jsonschema').Validator;

const timestamp = global.routes.include('lib', 'timestamp.js');
const du = global.routes.include('lib', 'debug-utilities.js');

const campaignController = global.routes.include('controllers', 'entities/Campaign');
const transactionEndpointController = global.routes.include('controllers', 'endpoints/transaction.js');

class acquireTokenController extends transactionEndpointController {

    constructor(){

        super({
            required_permissions: [
                'user/read',
                'account/read',
                'campaign/read',
                'affiliate/read',
                'affiliate/create',
                'tracker/read'
            ]
        });

    }

    execute(event){

        return this.preprocessing(event)
      .then((event) => this.acquireBody(event))
      .then((event) => this.validateInput(event, this.validateEventSchema))
      .then((event) => this.validateCampaign(event))
      .then((event) => this.handleAffiliateInformation(event))
      .then((event) => this.pushToRedshift(event))
			.then((event) => this.acquireToken());

    }

    validateEventSchema(parameters){

        let v = new Validator();
        let schema = global.routes.include('model', 'endpoints/token');
        let affiliates_schema = global.routes.include('model', 'endpoints/affiliates');

        v.addSchema(affiliates_schema, '/Affiliates');
        return v.validate(parameters, schema);

    }

    validateCampaign(event){

        return campaignController.get(event.campaign).then((campaign) => {

            if(!_.has(campaign, 'id')){ throw new Error('Invalid Campaign ID: '+event.campaign); }

            return event;

        });

    }

    pushToRedshift(event){

        du.debug('Push To Redshift');

        let event_object = this.createEventObject(event);

        return this.pushRecordToRedshift('events', event_object).then(() => {

            return event;

        });

    }

    acquireToken () {

        du.debug('Acquire Token');

        let user_alias = global.user.alias;

        let _timestamp = timestamp.createTimestampSeconds() + process.env.transaction_jwt_expiration;

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

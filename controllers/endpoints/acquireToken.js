'use strict';
const _ = require("underscore");
const Validator = require('jsonschema').Validator;

const jwtutilities  = global.routes.include('lib', 'jwt-utilities');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

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

        this.campaignController = global.routes.include('controllers', 'entities/Campaign');

    }

    execute(event){

        du.debug('Execute');

        return this.preprocessing(event)
      .then((event) => this.acquireBody(event))
      .then((event) => this.validateInput(event, this.validateEventSchema))
      .then((event) => this.validateCampaign(event))
      .then((event) => this.handleAffiliateInformation(event))
      .then((event) => this.pushToRedshift(event))
			.then(() => this.acquireToken());

    }

    validateEventSchema(parameters){

        du.debug('Validate Event Schema');

        let v = new Validator();
        let schema = global.routes.include('model', 'endpoints/token');
        let affiliates_schema = global.routes.include('model', 'endpoints/components/affiliates');

        v.addSchema(affiliates_schema, '/affiliates');
        return v.validate(parameters, schema);

    }

    validateCampaign(event){

        du.debug('Validate Campaign');

        return this.campaignController.get(event.campaign).then((campaign) => {

            if(!_.has(campaign, 'id')){ eu.throwError('bad_request','Invalid Campaign ID: '+event.campaign); }

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

        let transaction_jwt = jwtutilities.getJWT({user:{user_alias: global.user.alias}}, 'transaction');

        return Promise.resolve(transaction_jwt);

    }

}

module.exports = new acquireTokenController();

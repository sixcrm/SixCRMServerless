'use strict';
const jwt = require('jsonwebtoken');
const _ = require("underscore");

const timestamp = require('../../lib/timestamp.js');
const du = require('../../lib/debug-utilities.js');

const endpointController = require('../../controllers/endpoints/endpoint.js');

class acquireTokenController extends endpointController {

    constructor(){
        super({required_permissions: ['user/read','account/read']});
    }

    execute(event){

        return this.preprocessing(event)
			.then(this.validateInput)
			.then(this.acquireToken);

    }

	//Note: This is the sort of thing that is likely to be necessary however all functionality has been abstracted to other classes for the time being
    validateInput(event){

        du.debug('Validate Input');

        return Promise.resolve(event);

    }

    acquireToken (event) {

        du.debug('Validate Token');

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
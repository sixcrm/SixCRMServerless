'use strict'
const _ = require("underscore");
const jwt = require("jsonwebtoken");
const du = require('../../lib/debug-utilities.js');

/*
*  Note:  This is slightly different than the Auth0JWT verification method, and particularly around the decoded token structure.
*/

class verifyTransactionJWTController {

    constructor(){
        this.messages = {
            bypass: 'BYPASS'
        }
    }

    execute(event){

        return this.assureResources(event)
			.then((event) => this.acquireToken(event))
			.then((event) => this.verifyJWT(event));

    }

    assureResources(event){

        du.debug('Assure Resources');

        return new Promise((resolve, reject) => {

            if(!_.has(process.env, 'secret_key')){

                du.warning('Missing secret_key in environment variables.');

                return reject(new Error('JWT verification requires a secret key.'));

            }

            return resolve(event);

        });

    }

    acquireToken(event){

        du.debug('Acquire Token');

        return new Promise((resolve, reject) => {

            if(_.has(event, 'authorizationToken')){

                return resolve(event.authorizationToken);

            }

            return reject(false);

        });

    }

    verifyJWT(token){

        du.debug('Verify JWT');

        return new Promise((resolve, reject) => {

            let bypass = this.developmentBypass(token);

            if(bypass == true){

                return resolve(this.messages.bypass);

            }

            this.validateToken(token).then((decoded_token) => {

                if(decoded_token == false){ return resolve(false); }

                if(_.has(decoded_token, 'user_alias')){

                    return resolve(decoded_token.user_alias);

                }else{

                    return reject(new Error('Token missing user_alias property'));

                }


            }).catch((error) =>{

                return reject(error);

            });

        });

    }

    developmentBypass(token){

        du.debug('Development Bypass');

        if(_.has(process.env, 'stage') && _.contains(['local', 'development'], process.env.stage)){

            if(_.has(process.env, 'development_bypass') && token == process.env.development_bypass){

                du.warning('Executing Development Bypass');

                return true;

            }

        }

        return false;

    }

    validateToken(token){

        du.debug('Validate Token');

        return new Promise((resolve, reject) => {

            jwt.verify(token, process.env.secret_key, function(error, decoded) {

                du.debug('Decoded Token: ', decoded);

                if(_.isError(error)){ return reject(error); }

                if(!_.isObject(decoded)){ return resolve(false); }

                return resolve(decoded);

            });

        });

    }

}

module.exports = new verifyTransactionJWTController();
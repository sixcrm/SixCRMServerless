'use strict'
const _ = require("underscore");

const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

class verifyTransactionJWTController {

    constructor(){

        this.messages = {
            bypass: 'BYPASS'
        }

        jwtutilities.setJWTType('transaction');

    }

    execute(event){

        this.assureResources();

        return Promise.resolve(this.verifyJWT(this.acquireToken(event)));

    }

    assureResources(){

        du.debug('Assure Resources');

        if(!_.has(process.env, 'transaction_jwt_secret_key')){

            eu.throwError('server', 'Missing JWT secret key.');

        }

    }

    acquireToken(event){

        du.debug('Acquire Token');

        if(_.has(event, 'authorizationToken')){

            return event.authorizationToken;

        }

        return false;

    }

    verifyJWT(token){

        du.debug('Verify JWT');

        if(this.developmentBypass(token)){

            return this.messages.bypass;

        }

        let decoded_token = this.validateToken(token);

        du.debug('Decoded Token: ', decoded_token);

        if(decoded_token == false){ return false; }

        return decoded_token.user_alias; //Note: We know that this property exists because of the validation in the JWT Utilities class

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

        return jwtutilities.verifyJWT(token, 'transaction');

    }

}

module.exports = new verifyTransactionJWTController();

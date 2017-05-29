'use strict'
const _ = require("underscore");
const jwt = require("jsonwebtoken");
const du = global.routes.include('lib', 'debug-utilities.js');
const timestamp = global.routes.include('lib', 'timestamp.js');

const userSigningStringContoller = global.routes.include('controllers', 'entities/UserSigningString.js');
const userController = global.routes.include('controllers', 'entities/User.js');

class verifyAuth0JWTController {

    constructor(){
        this.messages = {
            bypass: 'BYPASS'
        }
    }

    execute(event){

        return this.acquireToken(event).then((token) => { return this.verifyJWT(token) });

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

    validateToken(token, signing_string) {

        du.debug('Validate Token');

        return new Promise((resolve) => {

            if(!_.has(process.env, 'secret_key')){ return resolve(false); }

            du.debug('Token: '+token, 'Secret: '+ signing_string);

            jwt.verify(token, signing_string, function(error, decoded) {

                du.debug('Decoded', decoded);

                if(_.isError(error) || !_.isObject(decoded)){

                    du.warning(error.message);

                    return resolve(false);

                }

                return resolve(decoded);

            });

        });
    }

    verifyJWT(token){

        du.debug('Verify JWT');

        return new Promise((resolve, reject) => {

            if(this.developmentBypass(token) == true){

                return resolve(this.messages.bypass);

            }

            // Validate token using default Auth0 private key.
            return this.validateToken(token, process.env.secret_key).then((decoded_token) => {

                du.debug(`Token validated to ${decoded_token}.`);

                if(decoded_token == false) {
                    // If we failed to verify jwt using Auth0 key, attempt to decode via user's signing key(s).
                    return this.decodeWithUserSigningStrings(token).then(result => {
                        return resolve(result);
                    });
                }

                du.debug('Decoded Token:', decoded_token);

                if(_.has(decoded_token, 'email')){

                    du.debug('Email present, returning');
                    return resolve(decoded_token.email);

                }else{

                    du.debug('Missing Email in token');
                    return resolve(false);

                }

            }).catch((error) =>{
                return reject(error);
            });

        });

    }

    /**
     * Decode token without verifying it's signature. Use this only to identify sender.
     * @param token
     */
    decodeToken(token){

        du.debug('Decode Token');

        return new Promise((resolve) => {

            du.debug('Token: '+token);

            return resolve(jwt.decode(token));
        });
    }

    /**
     * Iterate through user signing strings owned by token issuer, and attempt to validate given token with them.
     * Returns Promise-wrapped false if no strings can validate the token, and Promise-wrapped email of user if one of
     * the strings successfully validates.
     * @param token
     */
    decodeWithUserSigningStrings(token) {
        du.debug('Decode using users signing strings.');

        let successful_email = '';

        return this.decodeToken(token).then(decoded_token => {
            du.debug('Decoded token:', decoded_token);

            return decoded_token.email;
        }).then(email => {
            du.debug(`Getting user signing strings for ${email}.`);

            // we know the user, get her signing strings
            return userSigningStringContoller.listBySecondaryIndex('user', email, 'user-index');
        }).then(signing_strings => {
            du.debug(`Got user signing strings for user.`, signing_strings);

            let validateRequests = [];

            signing_strings.usersigningstrings.forEach(signing_string => {

                du.debug(`Validating token with string named ${signing_string.name}.`);

                validateRequests.push(this.validateToken(token, signing_string.signing_string).then(validation => {
                    if (validation) {

                        du.info(`Successfully used key ${signing_string.name}.`);

                        signing_string.used_at = timestamp.getISO8601(); // update used_at
                        userSigningStringContoller.update(signing_string);

                        successful_email = signing_string.user;

                        return true;
                    } else {
                        return false;
                    }
                }));
            });

            return Promise.all(validateRequests).then(results => {
                let atLeastOneKeyValid = results.reduce((previous, result) => { return previous || result });

                if (!atLeastOneKeyValid) {
                    du.debug('Could not find a valid signing string.');

                    return false;
                } else {
                    du.debug(`Successfully used signing key for ${successful_email}.`);

                    return successful_email;
                }
            });
        }).catch(error => {
            du.error('Error when decoding jwt using users signing keys.', error);
            return false;
        });
    }

    developmentBypass(token){

        if(_.has(process.env, 'stage') && _.contains(['local', 'development'], process.env.stage)){

            if(_.has(process.env, 'development_bypass') && token == process.env.development_bypass){

                return true;

            }

        }

        return false;

    }

}

module.exports = new verifyAuth0JWTController();

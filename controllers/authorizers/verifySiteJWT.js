'use strict'
const _ = require("underscore");
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const userSigningStringContoller = global.SixCRM.routes.include('controllers', 'entities/UserSigningString.js');

class verifySiteJWTController {

    constructor(){

        this.messages = {
            bypass: 'BYPASS'
        }

        jwtutilities.setJWTType('site');

    }

    execute(event){

        return this.acquireToken(event).then((token) => { return this.verifyJWT(token) });

    }

    acquireToken(event){

        du.debug('Acquire Token');

        return new Promise((resolve, reject) => {

            if(_.has(event, 'authorizationToken')){

              du.info("Authorization Token Acquired");

              return resolve(event.authorizationToken);

            }

            du.warning("Failed to acquire Authorization Token");

            return reject(false);

        });

    }

    validateToken(token, signing_string) {

        du.debug('Validate Token');

        let decoded;

        if(!_.isUndefined(signing_string)){

            decoded = jwtutilities.decodeAndValidateJWT(token, signing_string);

        }else{

          //du.info(token);

          decoded = jwtutilities.verifyJWT(token);

        }

        du.info(decoded);

        return Promise.resolve(decoded);

    }

    verifyJWT(token){

        du.debug('Verify JWT');

        return new Promise((resolve, reject) => {

            if(this.developmentBypass(token) == true){

                return resolve(this.messages.bypass);

            }

            this.validateToken(token).then((decoded_token) => {

                if(decoded_token == false) {

                  du.info('Token not validated.  Attempting User Signing Strings');

                  return resolve(this.decodeWithUserSigningStrings(token));

                }

                du.debug('Decoded Token:', decoded_token);

                return resolve(decoded_token.email);

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

        return Promise.resolve(jwtutilities.decodeJWT(token));

    }

    /**
     * Iterate through user signing strings owned by token issuer, and attempt to validate given token with them.
     * Returns Promise-wrapped false if no strings can validate the token, and Promise-wrapped email of user if one of
     * the strings successfully validates.
     * @param token
     */
    decodeWithUserSigningStrings(token) {

        du.debug('Decode using users signing strings.');

        return this.decodeToken(token).then((decoded_token) => {

            du.debug('Decoded token:', decoded_token);

            jwtutilities.validateJWTContents(decoded_token);

            return decoded_token.email;

        }).then((email) => {

            userSigningStringContoller.disableACLs();
            return userSigningStringContoller.listBySecondaryIndex({field: 'user', index_value: email}).then((results) => {
                userSigningStringContoller.enableACLs();

                if(_.has(results, 'usersigningstrings')){
                    return results.usersigningstrings;
                }
                return null;

            });

        }).then(signing_strings => {

            if(_.isArray(signing_strings) && signing_strings.length > 0){

                let validate_requests = [];

                signing_strings.forEach((signing_string) => {

                    du.debug(`Validating token with string named ${signing_string.name}.`);

                    validate_requests.push(this.validateTokenWithSigningString(token, signing_string));

                });

                return Promise.all(validate_requests).then(results => {

                    let successful_email = false;

                    results.some((result) => {

                        if(result !== false && _.isObject(result) && _.has(result, 'email')){

                            successful_email = result.email;

                        }

                    });

                    return successful_email;

                });

            }else{

                return null;

            }

        }).catch(error => {
            du.error('Error when decoding jwt using users signing keys.', error);
            return false;
        });

    }

    validateTokenWithSigningString(token, signing_string){

        du.debug('Validate Token With Signing String');

        return this.validateToken(token, signing_string.signing_string).then((decoded_token) => {

            if(decoded_token === false || !_.isObject(decoded_token) || !_.has(decoded_token, 'email')){

              du.warning('Unable to validate token.');

              return false;

            }

            du.info(`Successfully used key ${signing_string.name}.`);

            signing_string.used_at = timestamp.getISO8601();

            userSigningStringContoller.disableACLs();
            userSigningStringContoller.update({entity: signing_string});
            userSigningStringContoller.enableACLs();

            return decoded_token;

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

module.exports = new verifySiteJWTController();

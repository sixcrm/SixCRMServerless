'use strict'
const _ = require("underscore");
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

class verifySiteJWTController {

    constructor(){

      this.parameter_definition = {
        event: {
          required: {
            authorization_token: 'authorizationToken'
          },
          optional:{}
        }

      }

      this.parameter_validation = {
        user_signing_strings: global.SixCRM.routes.path('model', 'authorization/usersigningstrings.json'),
        encoded_authorization_token: global.SixCRM.routes.path('model', 'definitions/jwt.json'),
        decoded_authorization_token: global.SixCRM.routes.path('model', 'authorization/decodedauthorizationtoken.json')
      }

      this.messages = {
          bypass: 'BYPASS'
      }

      this.jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');
      this.jwtutilities.setJWTType('site');

      const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

      this.parameters = new Parameters({
        validation: this.parameter_validation,
        definition: this.parameter_definition
      });

      this.userSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString.js');

    }

    execute(event){

      return this.setParameters(event)
      .then(() => this.decodeToken())
      .then(() => this.verifyEncodedTokenWithSiteSecretKey())
      .then(() => this.verifyEncodedTokenWithUserSigningString())
      .then(() => this.respond());

    }

    decodeToken(){

      du.debug('Decode Token');

      let token = this.parameters.get('encoded_authorization_token');

      let decoded_token = this.jwtutilities.decodeJWT(token);

      if(decoded_token){

        this.parameters.set('decoded_authorization_token', decoded_token);

        return Promise.resolve();

      }

      eu.throwError('bad_request', 'Unable to decode token.');

    }

    verifyEncodedTokenWithSiteSecretKey(){

      du.debug('Verify Encoded Token With Site Secret Key');

      let encoded_token = this.parameters.get('encoded_authorization_token');

      if(this.jwtutilities.verifyJWT(encoded_token)){

        this.parameters.set('verified_authorization_token', encoded_token);

      }

      return Promise.resolve();

    }

    verifyEncodedTokenWithUserSigningString(){

      du.debug('Verify Encoded Token With User Signing String');

      let verified_token = this.parameters.get('verified_authorization_token', null, false);

      if(_.isNull(verified_token)){

        return this.getUserSigningStrings()
        .then(() => this.verifyEncodedTokenWithUserSigningStrings());

      }

      return Promise.resolve();

    }

    getUserSigningStrings(){

      du.debug('Get User Signing Strings');

      let user_id = this.parameters.get('decoded_authorization_token').email;

      this.userSigningStringController.disableACLs();
      //Technical Debt: update to list by user
      return this.userSigningStringController.listByUser({user: user_id})
      .then((results) => this.userSigningStringController.getResult(results, 'usersigningstrings'))
      .then(usersigningstrings => {
        this.userSigningStringController.enableACLs();

        if(arrayutilities.nonEmpty(usersigningstrings)){
          this.parameters.set('user_signing_strings', usersigningstrings);
        }

      });

    }

    verifyEncodedTokenWithUserSigningStrings(){

      du.debug('Verify Encoded Token With User Signing Strings');

      let user_signing_strings = this.parameters.get('user_signing_strings', null, false);

      if(!_.isNull(user_signing_strings)){

        let encoded_token = this.parameters.get('encoded_authorization_token');

        arrayutilities.find(user_signing_strings, (user_signing_string) => {
          if(this.jwtutilities.decodeJWT(encoded_token, user_signing_string.signing_string)){
            this.parameters.set('verified_authorization_token', encoded_token);
            return true;
          }
          return false;
        });

      }

    }

    respond(){

      du.debug('Respond');

      let verified_token = this.parameters.get('verified_authorization_token', null, false);

      if(!_.isNull(verified_token)){

        return this.parameters.get('decoded_authorization_token').email;

      }

      return null;

    }

    setParameters(event){

      du.debug('Set Parameters');

      this.parameters.setParameters({argumentation: event, action: 'event'});

      return Promise.resolve(true);

    }




    /*
    validateToken() {

      du.debug('Validate Token');

      let token = this.parameters.get('encoded_authorization_token');
      let user_signing_string = this.parameters.get('user_signing_string', null, false);

      let decoded;

      if(!_.isUndefined(signing_string)){

        decoded = jwtutilities.decodeAndValidateJWT(token, signing_string);

      }else{

        decoded = jwtutilities.verifyJWT(token);

      }

      return Promise.resolve(decoded);

    }


    decodeWithUserSigningStrings() {

      du.debug('Decode Using User Signing String');

      return this.decodeToken()
      .then(() => {

        let decoded_token = this.parameters.get('decoded_authorization_token');

        if(!_.isNull(decoded_token)){

          jwtutilities.validateJWTContents(decoded_token);
          return decoded_token.email;

        }
      })
      .then((email) => {

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
    */
}

module.exports = new verifySiteJWTController();

'use strict'
const _ =  require('underscore');
const Validator = require('jsonschema').Validator;
const jwt = require('jsonwebtoken');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mungeutilities = global.SixCRM.routes.include('lib', 'munge-utilities.js');

class JWTUtilities {

    constructor(){

        this.setParameters();

        this.jwt_types = ['transaction', 'site'];

    }

    decodeJWT(jwt_string){

        let decoded_jwt;

        try{

            decoded_jwt = jwt.decode(jwt_string);

        }catch(error){

            return false;

        }

        return decoded_jwt;

    }

    decodeAndValidateJWT(jwt_string, jwt_signing_string){

        let decoded_and_validated_jwt;

        try{

            decoded_and_validated_jwt = jwt.verify(jwt_string, jwt_signing_string);

        }catch(error){

            return false;

        }

        if(decoded_and_validated_jwt === false){ return false; }

        try{

            this.validateJWTContents(decoded_and_validated_jwt);

        }catch(error){

            return false;

        }

        return decoded_and_validated_jwt;

    }

    /*
    * Entrypoint
    */
    verifyJWT(submitted_jwt, jwt_type){

        this.setJWTType(jwt_type);

        let signing_key = this.getSigningKey()

        return this.decodeAndValidateJWT(submitted_jwt, signing_key);
    }

    setParameters(){

        let parameters = ['jwt_issuer', 'transaction_jwt_expiration', 'transaction_jwt_secret_key', 'site_jwt_expiration', 'site_jwt_secret_key'];

        if(_.isUndefined(this.jwt_parameters)){
            this.jwt_parameters = {};
        }

        parameters.forEach((parameter) => {

            if(_.has(process.env, parameter)){


                this.jwt_parameters[parameter] = process.env[parameter];

            }

        });

    }

    setJWTType(jwt_type){
        du.debug('Set JWT Type');

        if(!_.isUndefined(jwt_type)){

            if(_.contains(this.jwt_types, jwt_type)){
                this.jwt_type = jwt_type;
            }else{
                this.unrecognzedJWTType();
            }

        }

    }

    getJWTType(){
        du.debug('Get JWT Type');
        if(_.has(this, 'jwt_type')){

            return this.jwt_type;

        }

        eu.throwError('validation','Unset jwt_type property.');

    }

    getJWT(parameters, jwt_type){

        du.debug('Get JWT');

        this.setJWTType(jwt_type);

        let jwt_contents = this.createJWTContents(parameters);

        return this.signJWT(jwt_contents);

    }

    createJWTContents(parameters){

        du.debug('Create JWT Contents');

        let jwt_contents;

        switch(this.getJWTType()){

        case 'transaction':

            jwt_contents = this.createTransactionJWTContents(parameters);

            break;

        case 'site':

            jwt_contents = this.createSiteJWTContents(parameters);

            break;

        default:

            this.unrecognzedJWTType();

        }

        this.validateJWTContents(jwt_contents);

        return jwt_contents;

    }

    validateJWTContents(jwt_contents){

        du.debug('Validate JWT Contents');

        let validation_function;

        switch(this.getJWTType()){

        case 'transaction':

            validation_function = this.validateTransactionJWTContents;

            break;

        case 'site':

            validation_function = this.validateSiteJWTContents

            break;

        default:

            this.unrecognzedJWTType();

        }

        this.validateInput(jwt_contents, validation_function);

    }

    validateInput(object, validation_function){

        du.debug('Validate Input');

        if(!_.isFunction(validation_function)){
            eu.throwError('server','Validation function is not a function.');
        }

        if(_.isUndefined(object)){
            eu.getError('validation','Undefined object input.');
        }

      //Technical Debt:  Why is this necessary?
        var params = JSON.parse(JSON.stringify(object || {}));

        let validation = validation_function(params);

        if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

            du.warning(validation);

            eu.throwError(
              'validation',
              'One or more validation errors occurred.',
              {issues: validation.errors.map((e)=>{ return e.message; })}
            );

        }

    }

    validateTransactionJWTContents(contents){

        let transaction_jwt_schema = global.SixCRM.routes.include('model', 'jwt/transaction');

        let v = new Validator();

        return v.validate(contents, transaction_jwt_schema);

    }

    validateSiteJWTContents(contents){

        let site_jwt_schema = global.SixCRM.routes.include('model', 'jwt/site');

        let v = new Validator();

        return v.validate(contents, site_jwt_schema);

    }

    getUserAlias(user){

        du.debug('Get User Alias');

        if(_.has(user, 'user_alias')){
            return user.user_alias;
        }else if(_.has(user, 'id')){
            return mungeutilities.munge(user.id);
        }else if(_.has(user, 'email')){
            return mungeutilities.munge(user.email);
        }

        return null;

    }

    signJWT(jwt_body){

        let signing_key = this.getSigningKey();

        return jwt.sign(jwt_body, signing_key);

    }

    getSigningKey(){

        switch(this.getJWTType()){

        case 'transaction':

            if(!_.has(this.jwt_parameters, 'transaction_jwt_secret_key')){
                eu.throwError('validation','Transaction JWT secret key is not defined.');
            }

            return this.jwt_parameters.transaction_jwt_secret_key;

        case 'site':

            if(!_.has(this.jwt_parameters, 'site_jwt_secret_key')){
                  eu.throwError('validation','Site JST secret key is not defined.');
            }

            return this.jwt_parameters.site_jwt_secret_key;

        default:

            this.unrecognzedJWTType();

        }

    }

    unrecognzedJWTType(){

          eu.throwError('validation','Unrecognized JWT Type.');

    }

    createTransactionJWTContents(parameters){

        du.debug('Create Transaction JWT Contents');

        let user_alias = this.getUserAlias(parameters.user);

        let now = timestamp.createTimestampSeconds();

        let transaction_jwt_contents = {
            "iss": this.jwt_parameters.jwt_issuer,
            "sub": "",
            "aud": "",
            "iat": now,
            "exp": now + parseInt(this.jwt_parameters.transaction_jwt_expiration),
            "user_alias": user_alias
        };

        return transaction_jwt_contents;

    }

    createSiteJWTContents(parameters){

        let email = this.getUserEmail(parameters);

        let now = timestamp.createTimestampSeconds();

        return {
            "email": email,
            "email_verified": true,
            "picture": "",
            "iss": this.jwt_parameters.jwt_issuer,
            "sub": "",
            "aud": "",
            "exp": now + parseInt(this.jwt_parameters.site_jwt_expiration),
            "iat": now
        };

    }

    //Technical Debt:  Seems deprecated...
    getUserEmail(parameters){
        du.debug('Get User Email');
        if(_.has(parameters, 'user') && _.has(parameters.user, 'email')){
            return parameters.user.email;
        }
        eu.throwError('validation','Unable to get user email.');
    }

}

module.exports = new JWTUtilities;

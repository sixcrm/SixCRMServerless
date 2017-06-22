'use strict'
const _ =  require('underscore');
const Validator = require('jsonschema').Validator;
const jwt = require('jsonwebtoken');

const timestamp = global.routes.include('lib', 'timestamp.js');
const mungeutilities = global.routes.include('lib', 'munge-utilities.js');

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

        if(!_.isUndefined(jwt_type)){

            if(_.contains(this.jwt_types, jwt_type)){
                this.jwt_type = jwt_type;
            }else{
                this.unrecognzedJWTType();
            }

        }

    }

    getJWTType(){

        if(_.has(this, 'jwt_type')){

            return this.jwt_type;

        }

        throw new Error('Unset jwt_type property.');

    }

    getJWT(parameters, jwt_type){

        this.setJWTType(jwt_type);

        let jwt_contents = this.createJWTContents(parameters);

        return this.signJWT(jwt_contents);

    }

    createJWTContents(parameters){

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

        if(!_.isFunction(validation_function)){
            throw new Error('Validation function is not a function.');
        }

        if(_.isUndefined(object)){
            throw new Error('Undefined object input.');
        }

      //Technical Debt:  Why is this necessary?
        var params = JSON.parse(JSON.stringify(object || {}));

        let validation = validation_function(params);

        if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

            var error = {
                message: 'One or more validation errors occurred.',
                issues: validation.errors.map((e)=>{ return e.message; })
            };

            throw new Error(error.issues);

        }

    }

    validateTransactionJWTContents(contents){

        let transaction_jwt_schema = global.routes.include('model', 'jwt/transaction');

        let v = new Validator();

        return v.validate(contents, transaction_jwt_schema);

    }

    validateSiteJWTContents(contents){

        let site_jwt_schema = global.routes.include('model', 'jwt/site');

        let v = new Validator();

        return v.validate(contents, site_jwt_schema);

    }

    getUserAlias(user){

        if(_.has(user, 'id')){
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
                throw new Error('Transaction JWT secret key is not defined.');
            }

            return this.jwt_parameters.transaction_jwt_secret_key;

        case 'site':

            if(!_.has(this.jwt_parameters, 'site_jwt_secret_key')){
                throw new Error('Site JST secret key is not defined.');
            }

            return this.jwt_parameters.site_jwt_secret_key;

        default:

            this.unrecognzedJWTType();

        }

    }

    unrecognzedJWTType(){

        throw new Error('Unrecognized JWT Type.');

    }

    createTransactionJWTContents(parameters){

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
        if(_.has(parameters, 'user') && _.has(parameters.user, 'email')){
            return parameters.user.email;
        }
        throw new Error('Unable to get user email.');
    }

}

module.exports = new JWTUtilities;

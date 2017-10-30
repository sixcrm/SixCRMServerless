'use strict'
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');
const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

function getDecodedToken(){

  return {
    email: 'owner.user@test.com',
    email_verified: true,
    picture: '',
    iss: 'https://sixcrm.auth0.com/',
    sub: '',
    aud: '',
    exp: 1509339744,
    iat: 1509336144
  };

}

function getValidUserSigningStrings(){

  return [
    {
      "id": "6d662332-9a00-42e7-beef-44fb55142fb7",
      "user": "owner.user@test.com",
      "name": "test key 1",
      "signing_string": "somerandomstringthatprobablyshouldn'tbeused",
      "used_at": null,
      "created_at":"2017-04-06T18:40:41.405Z",
      "updated_at":"2017-04-06T18:41:12.521Z"
    }
  ];

}

function getInvalidToken(){

  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im93bmVyLnVzZXJAdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGljdHVyZSI6IiIsImlzcyI6Imh0dHBzOi8vc2l4Y3JtLmF1dGgwLmNvbS8iLCJzdWIiOiIiLCJhdWQiOiIiLCJleHAiOjE1MDkzMzM0NjgsImlhdCI6MTUwOTMyOTg2OH0.IPem1mYXoRgl4BTnHmtYIwl5MAVNXpMmtQG7glwGkW1';

}

function getValidEvent(){

  return {
    authorizationToken: getValidAuthorizationToken(getValidUser())
  };

}

function getValidAuthorizationToken(user){

  return testutilities.createTestAuth0JWT(user, global.SixCRM.configuration.site_config.jwt.site.secret_key);

}

function getValidUser(){
  return 'owner.user@test.com';
}

function setEnvironmentVariables(){

  process.env.site_jwt_expiration = global.SixCRM.configuration.site_config.jwt.site.expiration;
  process.env.site_jwt_secret_key = global.SixCRM.configuration.site_config.jwt.site.secret_key;
  process.env.jwt_issuer = global.SixCRM.configuration.site_config.jwt.issuer;

}

setEnvironmentVariables();

describe('controllers/authorizers/veryfySiteJWT.js', () => {

  let permissionedController;

  before(() => {
      mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
      });
  });

  beforeEach(() => {
    global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully executes the constructor', () => {

      let verifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');

    })

  });

  describe('setParameters', () => {

    it('successfully sets the parameters', () => {

      let test_event = getValidEvent();

      let verifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');

      verifySiteJWTController.setParameters(test_event);

      let authorization_token = verifySiteJWTController.parameters.get('authorization_token');

      expect(authorization_token).to.equal(test_event.authorizationToken);

    });

    it('throws an error when no argument is specified', () => {

      let verifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');

      try{
        verifySiteJWTController.setParameters();
      }catch(error){
        expect(error.message).to.equal('[500] Thing is not an object.');
      }

    });

    it('throws an error when argument with invalid structure is specified', () => {

      let verifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');

      try{
        verifySiteJWTController.setParameters({});
      }catch(error){
        expect(error.message).to.equal('[500] Missing source object field: "authorizationToken".');
      }

    });

  });

  describe('decodeToken', () => {

    it('successfully decodes a valid token', () => {

      let valid_token = getValidAuthorizationToken(getValidUser());

      let verifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');

      verifySiteJWTController.parameters.set('encoded_authorization_token', valid_token);

      return verifySiteJWTController.decodeToken().then(() => {

        let decoded_token = verifySiteJWTController.parameters.get('decoded_authorization_token', null, false);

        du.warning(decoded_token);

        expect(decoded_token).to.have.property('email');
        expect(decoded_token).to.have.property('exp');
        expect(decoded_token.email).to.equal(getValidUser());

      });

    });

    it('fails to decode a invalid token', () => {

      let verifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');

      verifySiteJWTController.parameters.set('encoded_authorization_token', getInvalidToken());

      try{

        verifySiteJWTController.decodeToken();

      }catch(error){

        expect(error.message).to.equal('[400] Unable to decode token.');

      }

    });

  });

  describe('verifyEncodedTokenWithSiteSecretKey', () => {

    it('successfully verifies a valid authorization_token using the site secret key', () => {

      let valid_token = getValidAuthorizationToken(getValidUser());

      du.info(valid_token);

      let verifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');

      verifySiteJWTController.parameters.set('encoded_authorization_token', valid_token);

      return verifySiteJWTController.verifyEncodedTokenWithSiteSecretKey().then(() => {

        let verified_token = verifySiteJWTController.parameters.get('verified_authorization_token');

        expect(verified_token).to.equal(valid_token);

      });

    });

    it('does not verify a invalid authorization_token using the site secret key', () => {

      let invalid_token = getInvalidToken();

      let verifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');

      verifySiteJWTController.parameters.set('encoded_authorization_token', invalid_token);

      return verifySiteJWTController.verifyEncodedTokenWithSiteSecretKey().then(() => {

        let verified_token = verifySiteJWTController.parameters.get('verified_authorization_token', null, false);

        expect(verified_token).to.equal(null);

      });

    });

  });

  describe('getUserSigningStrings', () => {

    it('successfully retrieves user signing strings', () => {

      mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSigningString.js'), {
        listByUser: ({user}) => {
          return Promise.resolve({usersigningstrings: getValidUserSigningStrings()});
        },
        disableACLs:() => {

        },
        enableACLs:() => {

        },
        getResult: (result, field) => {

          du.debug('Get Result');

          return Promise.resolve(result[field]);

        }

      });

      let decoded_token = getDecodedToken();

      let verifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');

      verifySiteJWTController.parameters.set('decoded_authorization_token', decoded_token);

      return verifySiteJWTController.getUserSigningStrings().then(() => {

        let signingstrings = verifySiteJWTController.parameters.get('user_signing_strings', null, false);

        expect(arrayutilities.nonEmpty(signingstrings)).to.equal(true);

      });

    });

  });

  describe('verifyEncodedTokenWithUserSigningStrings', () => {

    it('', () => {

    });

  });

  describe('respond', () => {

    it('', () => {

    });

  });

});

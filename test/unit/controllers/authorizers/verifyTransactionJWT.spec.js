'use strict'
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

function getValidUserAlias(){

  return '4ee23a8f5c8661612075a89e72a56a3c6d00df90';
}

function getValidTransactionJWT(){

  let raw_token = jwtutilities.createTransactionJWTContents({user: {user_alias: getValidUserAlias()}});

  du.warning(raw_token);

  return jwtutilities.signJWT(raw_token, global.SixCRM.configuration.site_config.jwt.transaction.secret_key);

}


function getValidEvent(){

  return {
    "type":"TOKEN",
    "methodArn":"arn:aws:execute-api:us-east-1:068070110666:8jmwnwcaic/null/GET/",
    "authorizationToken":getValidTransactionJWT()
  }

}

function setEnvironmentVariables(){

  process.env.jwt_issuer = 'https://development-api.sixcrm.com';
  process.env.transaction_jwt_expiration = global.SixCRM.configuration.site_config.jwt.transaction.expiration;
  process.env.transaction_jwt_secret_key = global.SixCRM.configuration.site_config.jwt.transaction.secret_key;
  process.env.jwt_issuer = global.SixCRM.configuration.site_config.jwt.issuer;

}

describe('controllers/authorizers/verifyTransactionJWT.js', () => {

  before(() => {

    setEnvironmentVariables();
    jwtutilities.setParameters();

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

      let verifyTransactionJWTController = global.SixCRM.routes.include('authorizers', 'verifyTransactionJWT.js');

    })

  });

  describe('execute', () => {

    it('successfully authorizes a valid Transaction JWT', () => {

      let valid_event = getValidEvent();

      let verifyTransactionJWTController = global.SixCRM.routes.include('authorizers', 'verifyTransactionJWT.js');

      return verifyTransactionJWTController.execute(valid_event).then((result) => {
        expect(result).to.equal(getValidUserAlias())
      });

    });

  });

});

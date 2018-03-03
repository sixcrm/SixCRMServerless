const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

describe('lib/sts-utilities', () => {

  before(() => {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  afterEach(() => {
    mockery.resetCache();
    mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully constructs', () => {
      let stsutilities = global.SixCRM.routes.include('lib','sts-utilities.js');

      expect(objectutilities.getClassName(stsutilities)).to.equal('STSUtilities');
    });

  });

  describe('assumeRole', () => {

    it('fails when missing RoleARN', () => {

      let stsutilities = global.SixCRM.routes.include('lib','sts-utilities.js');
      let parameters = {};

      try {
        stsutilities.assumeRole(parameters);
      }catch(error){
        expect(error.message).to.equal('[500] Missing source object field: "RoleArn".');
      }

    });

  });

  describe('assumeRole', () => {

    it('succeeds', () => {

      let response = {
        Credentials:{
          AccessKeyId:'abc',
          SecretAccessKey: 'abc',
          SessionToken: 'abc'
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('lib','aws-utilities.js'), class {
        constructor(){
          this.AWS = {
            STS: class {
              constructor(){

              }
              assumeRole(parameters, callback){
                return callback(null, response);
              }
            }
          }
        }
        AWSCallback(error, data){
          if(error){
            //eu.throwError('server', error);
          }
          return data;
        }
      });

      let stsutilities = global.SixCRM.routes.include('lib','sts-utilities.js');
      let parameters = {
        RoleArn: 'arn:aws:iam::1234567890:role/SomeRoleName'
      };

      return stsutilities.assumeRole(parameters).then(result => {
        expect(result).to.deep.equal(response);
      });

    });

  });

});

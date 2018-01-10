'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id){

  return MockEntities.getValidMessage(id);

}

let rebill_id = null

process.argv.forEach((val, index, array) => {
  if(stringutilities.isMatch(val, /^--rebill=[a-z0-9\-].*$/)){
    rebill_id = val.split('=')[1];
  }
});

describe('controllers/workers/recoverBilling', () => {

  describe('execute', () => {

    it('successfully executes', () => {

      rebill_id = (!_.isNull(rebill_id))?rebill_id:uuidV4();
      let message = getValidMessage(rebill_id);

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');

      return shipProductController.execute(message).then(result => {
        expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
        du.info(result, result.getCode());
        expect(result.getCode()).to.equal('success');
      });

    });

  });

});

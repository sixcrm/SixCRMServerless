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
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id){

  return MockEntities.getValidMessage(id);

}

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
process.exit();

describe('controllers/workers/shipProduct', () => {

  describe('execute', () => {

    it('successfully executes', () => {

      let message = getValidMessage('8ebe1767-8e6c-47a3-b761-cd67db283cbc');

      let shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

      return shipProductController.execute(message).then(result => {
        expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
        du.info(result, result.getCode())
        expect(result.getCode()).to.equal('success');
      });

    });

  });

});

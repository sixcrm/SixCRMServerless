const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
//const ShippingProviderResponse  = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');

describe('controllers/workers/statemachine/archive.js', () => {

  describe('constructor', () => {

    it('successfully constructs', () => {

      const ArchiveController = global.SixCRM.routes.include('workers', 'statemachine/archive.js');
      let archiveController = new ArchiveController();

      expect(objectutilities.getClassName(archiveController)).to.equal('ArchiveController');

    });

  });

  describe('execute', async () => {

    it('successfully executes', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      let event = {
        guid: shipping_receipt.id
      };

      const ArchiveController = global.SixCRM.routes.include('workers', 'statemachine/archive.js');
      let archiveController = new ArchiveController();

      let result = await archiveController.execute(event);

      expect(result).to.equal('ARCHIVED');

    });

  });

});

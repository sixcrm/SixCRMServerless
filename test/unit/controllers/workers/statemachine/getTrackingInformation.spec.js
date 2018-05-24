const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
//const ShippingProviderResponse  = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');

describe('controllers/workers/statemachine/getTrackingInformation.js', () => {

  describe('constructor', () => {

    it('successfully constructs', () => {

      const GetTrackingInformationController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingInformation.js');
      let getTrackingInformationController = new GetTrackingInformationController();

      expect(objectutilities.getClassName(getTrackingInformationController)).to.equal('GetTrackingInformationController');

    });

  });

  describe('execute', async () => {

    it('successfully executes', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      let event = {
        guid: shipping_receipt.id
      };

      const GetTrackingInformationController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingInformation.js');
      let getTrackingInformationController = new GetTrackingInformationController();

      let result = await getTrackingInformationController.execute(event);

      expect(result).to.equal('DELIVERED');

    });

  });

});

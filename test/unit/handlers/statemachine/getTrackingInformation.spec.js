const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
//const ShippingProviderResponse  = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');

describe('handlers/statemachine/handlers.gettrackinginformation', async () => {

  it('executes correctly', async () => {

    let shipping_receipt = MockEntities.getValidShippingReceipt();

    let event = {
      guid: shipping_receipt.id
    };

    let handlers = global.SixCRM.routes.include('root', 'handlers/statemachine/handlers.js');
    let controller_function = handlers.gettrackinginformation;

    controller_function(event, {}, (error, message) => {
      expect(message).to.equal('DELIVERED');
    }, null);

  });

});

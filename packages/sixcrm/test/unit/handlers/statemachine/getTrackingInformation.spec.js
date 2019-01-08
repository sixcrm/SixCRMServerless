const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
//const ShippingProviderResponse  = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');

xdescribe('handlers/statemachine/handlers.gettrackinginformation', async () => {

  it('executes correctly', async () => {

    let shipping_receipt = MockEntities.getValidShippingReceipt();

    let event = {
      guid: shipping_receipt.id
    };

    let handlers = global.SixCRM.routes.include('root', 'handlers/statemachine/handlers.js');
    let controller_function = handlers.gettrackinginformation;

    //Technical Debt:  Why would this work?!
    return controller_function(event, {}, (error, message) => {
      expect(message).to.equal('DELIVERED');
    }, null);

  });

});

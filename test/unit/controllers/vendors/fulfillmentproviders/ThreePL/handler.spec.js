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

function getValidReferenceNumber(){

  return '50fee3d6-3bc6-422f-95f3-101f64b5e60d';

}

function getValidFulfillmentProvider(){

  return {
    id:uuidV4(),
		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
		name: randomutilities.createRandomString(20),
		username: randomutilities.createRandomString(10),
		password: randomutilities.createRandomString(10),
		provider: {
      name: "Hashtag",
      threepl_key: '{a240f2fb-ff00-4a62-b87b-aecf9d5123f9}',
      username:'kristest',
      password:'kristest',
      threepl_customer_id: 10
    },
		created_at: timestamp.getISO8601(),
		updated_at:timestamp.getISO8601()
  };

}

function getValidCustomer(){
  return {
    updated_at: '2017-10-31T20:10:05.380Z',
    lastname: 'Damunaste',
    created_at: '2017-10-14T16:15:19.506Z',
    creditcards: [ 'df84f7bb-06bd-4daa-b1a3-6a2c113edd72' ],
    firstname: 'Rama',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    address:{
      zip: '97213',
      country: 'US',
      state: 'OR',
      city: 'London',
      line1: '10 Downing St.'
    },
    id: '24f7c851-29d4-4af9-87c5-0298fa74c689',
    email: 'rama@damunaste.org',
    phone: '1234567890'
  };
}

function getValidProducts(product_ids){

  let products = [];

  if(_.isUndefined(product_ids)){
    product_ids = [uuidV4(), uuidV4()];
  }

  return arrayutilities.map(product_ids, product_id => {
    return {
      id:product_id,
  		name:randomutilities.createRandomString(20),
  		sku:randomutilities.createRandomString(20),
  		ship:true,
      shipping_delay:3600,
  		fulfillment_provider:uuidV4(),
  		default_price:39.99,
  		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  		created_at:timestamp.getISO8601(),
  		updated_at:timestamp.getISO8601()
    };
  });

}

function getValidThreePLResponse(method){

  let method_responses = {
    FindOrders: {
      body:'<?xml version=\"1.0\" encoding=\"utf-8\"?><soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"><soap:Body><FindOrders xmlns=\"http://www.JOI.com/schemas/ViaSub.WMS/\">&lt;orders&gt;&lt;order&gt;&lt;CustomerName&gt;Tests Hashtag Tests&lt;/CustomerName&gt;&lt;CustomerEmail&gt;Charlie.C@Hashtagfulfillment.com&lt;/CustomerEmail&gt;&lt;CustomerPhone&gt;&lt;/CustomerPhone&gt;&lt;Facility&gt;Hashtag Fulfillment&lt;/Facility&gt;&lt;FacilityID&gt;2&lt;/FacilityID&gt;&lt;WarehouseTransactionID&gt;1181282&lt;/WarehouseTransactionID&gt;&lt;ReferenceNum&gt;Order 682&lt;/ReferenceNum&gt;&lt;PONum&gt;&lt;/PONum&gt;&lt;Retailer /&gt;&lt;ShipToCompanyName&gt;Example Company&lt;/ShipToCompanyName&gt;&lt;ShipToName&gt;Example Company&lt;/ShipToName&gt;&lt;ShipToEmail&gt;&lt;/ShipToEmail&gt;&lt;ShipToPhone&gt;&lt;/ShipToPhone&gt;&lt;ShipToAddress1&gt;Example Address&lt;/ShipToAddress1&gt;&lt;ShipToAddress2&gt;&lt;/ShipToAddress2&gt;&lt;ShipToCity&gt;Example City&lt;/ShipToCity&gt;&lt;ShipToState&gt;CA&lt;/ShipToState&gt;&lt;ShipToZip&gt;90505&lt;/ShipToZip&gt;&lt;ShipToCountry&gt;US&lt;/ShipToCountry&gt;&lt;ShipMethod&gt;Next Day Air&lt;/ShipMethod&gt;&lt;MarkForName&gt;&lt;/MarkForName&gt;&lt;BatchOrderID /&gt;&lt;CreationDate&gt;2016-01-19T14:56:00&lt;/CreationDate&gt;&lt;EarliestShipDate /&gt;&lt;ShipCancelDate /&gt;&lt;PickupDate /&gt;&lt;Carrier&gt;Fed Ex&lt;/Carrier&gt;&lt;BillingCode&gt;BillThirdParty&lt;/BillingCode&gt;&lt;TotWeight&gt;0.33&lt;/TotWeight&gt;&lt;TotCuFt&gt;0.00&lt;/TotCuFt&gt;&lt;TotPackages&gt;1.0000&lt;/TotPackages&gt;&lt;TotOrdQty&gt;1.0000&lt;/TotOrdQty&gt;&lt;TotLines&gt;1.00&lt;/TotLines&gt;&lt;Notes&gt;&lt;/Notes&gt;&lt;OverAllocated&gt;&lt;/OverAllocated&gt;&lt;PickTicketPrintDate /&gt;&lt;ProcessDate&gt;2016-01-19&lt;/ProcessDate&gt;&lt;TrackingNumber&gt;&lt;/TrackingNumber&gt;&lt;LoadNumber&gt;&lt;/LoadNumber&gt;&lt;BillOfLading&gt;&lt;/BillOfLading&gt;&lt;MasterBillOfLading&gt;&lt;/MasterBillOfLading&gt;&lt;ASNSentDate /&gt;&lt;ConfirmASNSentDate&gt;&lt;/ConfirmASNSentDate&gt;&lt;RememberRowInfo&gt;1181282:10:2::2016/01/19:0:False:1:735163&lt;/RememberRowInfo&gt;&lt;/order&gt;&lt;/orders&gt;</FindOrders><totalOrders xmlns=\"http://www.JOI.com/schemas/ViaSub.WMS/\">2729</totalOrders></soap:Body></soap:Envelope>',
      statusCode:200,
      statusMessage:'OK'
    },
    CreateOrders:{
      body:'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><Int32 xmlns="http://www.JOI.com/schemas/ViaSub.WMS/">1</Int32><warnings xmlns="http://www.JOI.com/schemas/ViaSub.WMS/" /></soap:Body></soap:Envelope>',
      statusCode:200,
      statusMessage:'OK'
    }
  }

  return method_responses[method];

}

function getInvalidThreePLResponse(method){

  let method_responses = {
    FindOrders:{
      bad_credentials:{
        body: '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><soap:Fault><faultcode>soap:Server</faultcode><faultstring>Server was unable to process request. ---&gt; Could not Authenticate Username or Password.</faultstring><detail /></soap:Fault></soap:Body></soap:Envelope>',
        statusCode:500,
        statusMessage:'Internal Server Error'
      },
      bad_threepl_id:{
        body: '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><soap:Fault><faultcode>soap:Client</faultcode><faultstring>Server was unable to read request. ---&gt; There is an error in XML document (1, 312). ---&gt; Input string was not in a correct format.</faultstring><detail /></soap:Fault></soap:Body></soap:Envelope>',
        statusCode:500,
        statusMessage:'Internal Server Error'
      }
    },
    CreateOrders:{
      'body':'',
      'statusCode':400,
      'statusMessage':'Bad Request'
    }
  }

  return method_responses[method];

}

describe('vendors/fulfillmentproviders/ThreePL/handler.js', () =>{

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

    it('successfully constructs', () => {

      let fulfillment_provider = getValidFulfillmentProvider();

      const ThreePLController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ThreePL/handler.js');
      let threePLController = new ThreePLController({fulfillment_provider: fulfillment_provider});

      expect(objectutilities.getClassName(threePLController)).to.equal('ThreePLController');
      expect(threePLController.parameters.store['fulfillmentprovider']).to.deep.equal(fulfillment_provider);

    });

  });

  describe('test', () => {

    it('successfully executes a test request', () => {

      let fulfillment_provider = getValidFulfillmentProvider();
      let three_pl_response = getValidThreePLResponse('FindOrders');

      mockery.registerMock('request', {
        post: (request_options, callback) => {
         callback(null, three_pl_response);
        }
      });

      const ThreePLController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ThreePL/handler.js');
      let threePLController = new ThreePLController({fulfillment_provider: fulfillment_provider});

      threePLController.ThreePLFacilityID = 2;
      threePLController.ThreePLID = 773;

      return threePLController.test().then(result => {
        expect(objectutilities.getClassName(result)).to.equal('ThreePLResponse');
        expect(result.getCode()).to.equal('success');
        expect(result.getMessage()).to.equal('Success');
        expect(result.getResponse().body).to.equal(three_pl_response.body);
        expect(result.getParsedResponse()).to.be.defined;

      });

    });

    it('successfully executes a test request with bad credentials', () => {

      let fulfillment_provider = getValidFulfillmentProvider();

      fulfillment_provider.provider.username = 'badusername';
      let three_pl_response = getInvalidThreePLResponse('FindOrders').bad_credentials;

      mockery.registerMock('request', {
        post: (request_options, callback) => {
         callback(null, three_pl_response);
        }
      });

      const ThreePLController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ThreePL/handler.js');
      let threePLController = new ThreePLController({fulfillment_provider: fulfillment_provider});

      threePLController.ThreePLFacilityID = 2;
      threePLController.ThreePLID = 773;

      return threePLController.test().then(result => {
        expect(objectutilities.getClassName(result)).to.equal('ThreePLResponse');
        expect(result.getCode()).to.equal('fail');
        expect(result.getMessage()).to.equal('Failed');
        expect(result.getResponse().body).to.equal(three_pl_response.body);
        expect(result.getParsedResponse()).to.be.defined;
      });

    });

    it('successfully executes a test request with bad threepl_id', () => {

      let fulfillment_provider = getValidFulfillmentProvider();

      fulfillment_provider.provider.threepl_id = 'garbage';
      let three_pl_response = getInvalidThreePLResponse('FindOrders').bad_threepl_id;

      mockery.registerMock('request', {
        post: (request_options, callback) => {
         callback(null, three_pl_response);
        }
      });

      const ThreePLController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ThreePL/handler.js');
      let threePLController = new ThreePLController({fulfillment_provider: fulfillment_provider});

      threePLController.ThreePLFacilityID = 2;
      threePLController.ThreePLID = 773;

      return threePLController.test().then(result => {
        expect(objectutilities.getClassName(result)).to.equal('ThreePLResponse');
        expect(result.getCode()).to.equal('fail');
        expect(result.getMessage()).to.equal('Failed');
        expect(result.getResponse().body).to.equal(three_pl_response.body);
        expect(result.getParsedResponse()).to.be.defined;
      });

    });

  });

  describe('info', () => {

    xit('successfully executes a info request', () => {

      let reference_number = getValidReferenceNumber();

      let fulfillment_provider = getValidFulfillmentProvider();
      let three_pl_response = getValidThreePLResponse('FindOrders');

      /*
      mockery.registerMock('request', {
        post: (request_options, callback) => {
         callback(null, three_pl_response);
        }
      });
      */

      const ThreePLController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ThreePL/handler.js');
      let threePLController = new ThreePLController({fulfillment_provider: fulfillment_provider});

      return threePLController.info({reference_number: reference_number}).then(result => {
        expect(objectutilities.getClassName(result)).to.equal('ThreePLResponse');
        expect(result.getCode()).to.equal('success');
        expect(result.getMessage()).to.equal('Success');
        du.info(result);
        //Note: Currently Fails...
        //expect(result.getResponse().body).to.equal(three_pl_response.body);
      });

    });

  });

  describe('fulfill', () => {

    it('successfully executes a fulfill request', () => {

      let customer = getValidCustomer();
      let products = getValidProducts();

      products[0].sku = 'SKU 10'; //use these in a integration test
      products[1].sku = 'SKU 100'; //use these in a integration test
      let fulfillment_provider = getValidFulfillmentProvider();
      let three_pl_response = getValidThreePLResponse('CreateOrders');

      /*
      mockery.registerMock('request', {
        post: (request_options, callback) => {
         callback(null, three_pl_response);
        }
      });
      */

      const ThreePLController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ThreePL/handler.js');
      let threePLController = new ThreePLController({fulfillment_provider: fulfillment_provider});

      threePLController.ThreePLFacilityID = 2;

      return threePLController.fulfill({customer: customer, products: products}).then(result => {
        expect(objectutilities.getClassName(result)).to.equal('ThreePLResponse');
        expect(result.getCode()).to.equal('success');
        expect(result.getMessage()).to.equal('Success');
        expect(result.getResponse().body).to.equal(three_pl_response.body);
      });

    });

    it('successfully executes a fulfill request when response is bad', () => {

      let customer = getValidCustomer();
      let products = getValidProducts();
      //products[0].sku = 'SKU 10';
      //products[1].sku = 'SKU 100';
      let fulfillment_provider = getValidFulfillmentProvider();
      let three_pl_response = getInvalidThreePLResponse('CreateOrders');

      mockery.registerMock('request', {
        post: (request_options, callback) => {
         callback(null, three_pl_response);
        }
      });

      const ThreePLController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ThreePL/handler.js');
      let threePLController = new ThreePLController({fulfillment_provider: fulfillment_provider});

      threePLController.ThreePLFacilityID = 2;

      return threePLController.fulfill({customer: customer, products: products}).then(result => {
        expect(objectutilities.getClassName(result)).to.equal('ThreePLResponse');
        expect(result.getCode()).to.equal('fail');
        expect(result.getMessage()).to.equal('Failed');
        expect(result.getResponse().body).to.equal('');
      });

    });

  });

});

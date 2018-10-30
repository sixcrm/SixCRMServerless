

const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const mathutilities = require('@6crm/sixcrmcore/util/math-utilities').default;
const randomutilities = require('@6crm/sixcrmcore/util/random').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidTestVendorParsedResponse(){

	return {
		orders:{
			order:[
				{ CustomerName: [ 'Tests Hashtag Tests' ],
					CustomerEmail: [ 'Charlie.C@Hashtagfulfillment.com' ],
					CustomerPhone: [ '' ],
					Facility: [ 'Hashtag Fulfillment' ],
					FacilityID: [ '2' ],
					WarehouseTransactionID: [ '1181282' ],
					ReferenceNum: [ 'Order 682' ],
					PONum: [ '' ],
					Retailer: [ '' ],
					ShipToCompanyName: [ 'Example Company' ],
					ShipToName: [ 'Example Company' ],
					ShipToEmail: [ '' ],
					ShipToPhone: [ '' ],
					ShipToAddress1: [ 'Example Address' ],
					ShipToAddress2: [ '' ],
					ShipToCity: [ 'Example City' ],
					ShipToState: [ 'CA' ],
					ShipToZip: [ '90505' ],
					ShipToCountry: [ 'US' ],
					ShipMethod: [ 'Next Day Air' ],
					MarkForName: [ '' ],
					BatchOrderID: [ '' ],
					CreationDate: [ '2016-01-19T14:56:00' ],
					EarliestShipDate: [ '' ],
					ShipCancelDate: [ '' ],
					PickupDate: [ '' ],
					Carrier: [ 'Fed Ex' ],
					BillingCode: [ 'BillThirdParty' ],
					TotWeight: [ '0.33' ],
					TotCuFt: [ '0.00' ],
					TotPackages: [ '1.0000' ],
					TotOrdQty: [ '1.0000' ],
					TotLines: [ '1.00' ],
					Notes: [ '' ],
					OverAllocated: [ '' ],
					PickTicketPrintDate: [ '' ],
					ProcessDate: [ '2016-01-19' ],
					TrackingNumber: [ '' ],
					LoadNumber: [ '' ],
					BillOfLading: [ '' ],
					MasterBillOfLading: [ '' ],
					ASNSentDate: [ '' ],
					ConfirmASNSentDate: [ '' ],
					RememberRowInfo: [ '1181282:10:2::2016/01/19:0:False:1:735163' ]
				}
			]
		}
	};

}

function getValidTerminalResponseClass(){

	let response_prototype = {
		response_type: 'success',
		vendor_response: getValidTestVendorParsedResponse()
	};

	const TerminalResponse = global.SixCRM.routes.include('providers', 'terminal/Response.js');

	return new TerminalResponse(response_prototype);

}

function getValidFulfillmentProvider(){

	return {
		id:uuidV4(),
		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
		name: randomutilities.createRandomString(20),
		provider:{
			name:"Hashtag",
			username: 'kristest',
  		password: 'kristest',
			threepl_key:'{a240f2fb-ff00-4a62-b87b-aecf9d5123f9}',
			threepl_customer_id: 10
		},
		created_at: timestamp.getISO8601(),
		updated_at:timestamp.getISO8601()
	};

}

describe('/helpers/entities/fulfillmentprovider/FulfillmentProvider.json', () => {

	before(() => {
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

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			const FulfillmentProviderHelperController = global.SixCRM.routes.include('helpers', 'entities/fulfillmentprovider/FulfillmentProvider.js');
			let fulfillmentProviderHelperController = new FulfillmentProviderHelperController();

			expect(objectutilities.getClassName(fulfillmentProviderHelperController)).to.equal('FulfillmentProviderHelperController');

		});

	});

	describe('validate', () => {

		it('successfully validates a fulfillment provider', () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');
			let fulfillment_provider = getValidFulfillmentProvider();
			let terminal_response_class = getValidTerminalResponseClass();

			let mock_terminal = class {
				constructor(){

				}
				test({fulfillment_provider_id}){
					return Promise.resolve(terminal_response_class);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Terminal.js'), mock_terminal);

			const FulfillmentProviderHelperController = global.SixCRM.routes.include('helpers', 'entities/fulfillmentprovider/FulfillmentProvider.js');
			let fulfillmentProviderHelperController = new FulfillmentProviderHelperController();

			return fulfillmentProviderHelperController.validate({fulfillment_provider_id:fulfillment_provider.id}).then(result => {

				expect(result).to.have.property('code');
				expect(result).to.have.property('vendor_response');
				expect(result.code).to.equal(terminal_response_class.getCode());
				expect(result.vendor_response).to.equal(terminal_response_class.getVendorResponse());

			});

		});

	});

	describe('executeValidation', () => {

		it('successfully executes validation', () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');
			let fulfillment_provider = getValidFulfillmentProvider();
			let terminal_response_class = getValidTerminalResponseClass();

			let mock_terminal = class {
				constructor(){

				}
				test({fulfillment_provider_id}){
					return Promise.resolve(terminal_response_class);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Terminal.js'), mock_terminal);

			const FulfillmentProviderHelperController = global.SixCRM.routes.include('helpers', 'entities/fulfillmentprovider/FulfillmentProvider.js');
			let fulfillmentProviderHelperController = new FulfillmentProviderHelperController();

			fulfillmentProviderHelperController.parameters.set('fulfillmentproviderid', fulfillment_provider.id);

			return fulfillmentProviderHelperController.executeValidation().then(result => {
				expect(result).to.equal(true);
				expect(fulfillmentProviderHelperController.parameters.store['terminalresponseclass']).to.deep.equal(terminal_response_class);
			});

		});

	});

	describe('transformValidationResponse', () => {

		it('succesfully transforms a terminal response class', () => {

			let terminal_response_class = getValidTerminalResponseClass();

			const FulfillmentProviderHelperController = global.SixCRM.routes.include('helpers', 'entities/fulfillmentprovider/FulfillmentProvider.js');
			let fulfillmentProviderHelperController = new FulfillmentProviderHelperController();

			fulfillmentProviderHelperController.parameters.set('terminalresponseclass', terminal_response_class);

			let result = fulfillmentProviderHelperController.transformValidationResponse();

			expect(result).to.equal(true);
			expect(fulfillmentProviderHelperController.parameters.store['transformedvalidationresponse']).to.deep.equal({
				code: terminal_response_class.getCode(),
				vendor_response: terminal_response_class.getVendorResponse()
			});

		});

	});

});

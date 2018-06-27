
var _ =  require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const TrackerResponse = global.SixCRM.routes.include('providers', 'tracker/Response.js');
const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js')

module.exports = class TrackerUtilitiesController extends PermissionedController  {

	constructor(){

		super();

		this.parameter_definition = {
			info:{
				required: {
					shippingreceipt:'shipping_receipt'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			shippingreceipt: global.SixCRM.routes.path('model', 'providers/tracker/trackableshippingreceipt.json')
		};

		this.shippingReceiptController = new ShippingReceiptController();

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	acquireShippingReceipt(){

		du.debug('Acquire Shipping Receipt');

		let shipping_receipt = this.parameters.get('shippingreceipt');

		return this.shippingReceiptController.get({id: shipping_receipt.id}).then(shipping_receipt => {

			this.parameters.set('shippingreceipt', shipping_receipt);

			return true;

		});

	}

	respond(){

		du.debug('Respond');

		let response_prototype = {
			response_type: this.parameters.get('responsecode')
		};

		let vendor_response_class = this.parameters.get('vendorresponseclass', {fatal: false});

		if(!_.isNull(vendor_response_class) && _.isFunction(vendor_response_class.getParsedResponse)){
			response_prototype.vendor_response = vendor_response_class.getParsedResponse();
		}

		return new TrackerResponse(response_prototype);

	}

}

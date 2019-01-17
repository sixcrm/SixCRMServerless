
const _ = require('lodash');
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class ShippingReceiptController extends entityController {

	constructor(){
		super('shippingreceipt');

		this.search_fields = ['status'];
	}

	//Technical Debt:  What is this?  This belongs in a helper me thinks...
	createShippingReceiptObject(params){

		var return_object = {
			created: timestamp.createTimestampSeconds(),
			status: params.status
		}

		return return_object;

	}

	getFulfillmentProvider(shipping_receipt){
		if(_.has(shipping_receipt, "fulfillment_provider")){

			return this.executeAssociatedEntityFunction('FulfillmentProviderController', 'get', {id: shipping_receipt.fulfillment_provider});

		}else{

			return Promise.resolve(null);

		}

	}

}



const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const xmlutilities = require('@6crm/sixcrmcore/util/xml-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

const FulfillmentProviderVendorResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');

module.exports = class ThreePLResponse extends FulfillmentProviderVendorResponse {

	constructor(){

		super(arguments[0]);

	}

	translateResponse(response){
		let action = this.parameters.get('action');

		let translation_methods = {
			test:'translateTest',
			info:'translateInfo',
			fulfill:'translateFulfill'
		};

		return this[translation_methods[action]](response);

	}

	translateInfo(response){
		if(!stringutilities.nonEmpty(response.body)){ return null; }

		let parsed_response = xmlutilities.parse(response.body);

		if(objectutilities.hasRecursive(parsed_response, 'soap:Envelope.soap:Body.0.totalOrders.0._', false)){
			return this.parseFindOrdersResponse(parsed_response);
		}

		throw eu.getError('server', 'Unrecognized response from ThreePL');

	}

	translateTest(response){
		if(!stringutilities.nonEmpty(response.body)){
			//Technical Debt:  Throw Error?
			return null;
		}

		let parsed_response = xmlutilities.parse(response.body);

		if(objectutilities.hasRecursive(parsed_response, 'soap:Envelope.soap:Body.0.FindOrders.0._', false)){

			return {
				success: true,
				message: 'Successfully validated.'
			};

		}

		if(objectutilities.hasRecursive(parsed_response, 'soap:Envelope.soap:Body.0.soap:Fault.0')){

			return {
				success: false,
				message: parsed_response['soap:Envelope']['soap:Body'][0]['soap:Fault'][0].faultstring
			}
		}

		throw eu.getError('server', "Unrecognized ThreePL response body: "+response.body);

	}

	translateFulfill(response){
		if(!stringutilities.nonEmpty(response.body)){ return null; }

		let reference_number = this.acquireReferenceNumber();

		let response_prototype = {
			success: false,
			message: 'Non-specific failure.',
			reference_number:reference_number
		};

		let parsed_response = xmlutilities.parse(response.body);

		if(objectutilities.hasRecursive(parsed_response, 'soap:Envelope.soap:Body.0.Int32.0._', false)){

			let response = parsed_response['soap:Envelope']['soap:Body'][0].Int32[0]['_'];

			if(response == 1){

				response_prototype.success = true;
				response_prototype.message = 'Success';

			}

		}

		return response_prototype;

	}

	acquireReferenceNumber(fatal){
		fatal = _.isUndefined(fatal)?true:fatal;

		let additional_parameters = this.parameters.get('additionalparameters', {fatal: false});

		if(!_.isNull(additional_parameters)){

			if(_.has(additional_parameters, 'reference_number')){

				return additional_parameters.reference_number;

			}else{

				if(fatal){ throw eu.getError('server', 'Missing reference_number in vendor response additional_parameters.'); }

			}

		}else{

			if(fatal){ throw eu.getError('server', 'Missing additional_parameters in vendor response.'); }

		}

		return null;

	}

	parseFindOrdersResponse(parsed_response){
		let order_count = parsed_response['soap:Envelope']['soap:Body'][0].totalOrders[0]['_'];
		let orders = [];

		if(order_count > 0){

			orders = this.getOrdersFromFindOrdersResponse(parsed_response);

		}

		return {
			orders: orders
		};

	}

	getOrdersFromFindOrdersResponse(parsed_response){
		parsed_response = xmlutilities.parse(parsed_response['soap:Envelope']['soap:Body'][0].FindOrders[0]['_']);

		return arrayutilities.map(parsed_response.orders.order, order => {

			return {
				customer: this.createCustomer(order),
				shipping: this.createShippingInformation(order),
				reference_number: this.createReferenceNumber(order),
				created_at: this.createCreatedAt(order)
			};

		});

	}

	createCustomer(order){
		let customer = {
			name:order.CustomerName[0],
			email:(stringutilities.nonEmpty(order.CustomerEmail[0]))?order.CustomerEmail[0]:null,
			phone:(stringutilities.nonEmpty(order.CustomerPhone[0]))?order.CustomerPhone[0]:null,
		};

		if(stringutilities.nonEmpty(order.ShipToAddress2[0])){
			customer.address = {line2: order.ShipToAddress2[0]};
		}

		return customer;

	}

	createShippingInformation(order){
		let address = {
			name: order.ShipToName[0],
			line1:order.ShipToAddress1[0],
			city:order.ShipToCity[0],
			state:order.ShipToState[0],
			zip:order.ShipToZip[0],
			country:order.ShipToCountry[0]
		};

		if(stringutilities.nonEmpty(order.ShipToAddress2[0])){
			address.line2 = order.ShipToAddress2[0];
		}

		return {
			address: address,
			carrier:order.Carrier[0],
			tracking_number: (stringutilities.nonEmpty(order.TrackingNumber[0]))?order.TrackingNumber[0]:null,
			method: (stringutilities.nonEmpty(order.ShipMethod[0]))?order.ShipMethod[0]:null
		};

	}

	createReferenceNumber(order){
		return order.ReferenceNum[0];

	}

	createCreatedAt(order){
		return timestamp.convertToISO8601(order.CreationDate[0]);

	}

}


const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const FulfillmentProviderVendorResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');

module.exports = class ShipStationResponse extends FulfillmentProviderVendorResponse {

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
		du.debug(response);
		if(objectutilities.hasRecursive(response.body, 'fulfillments', false)){

			let orders = arrayutilities.map(response.body.fulfillments, fulfillment => {

				if(_.has(fulfillment, 'orderNumber')){

					let return_parameters = {
						'reference_number':fulfillment.orderNumber
					};

					return_parameters['customer'] = objectutilities.transcribe(
						{
							name:'shipTo.name',
							email: 'customerEmail',
						},
						fulfillment,
						{},
						false
					);

					let shipping = objectutilities.transcribe(
						{
							carrier:'carrierCode',
							tracking_number: 'trackingNumber',
						},
						fulfillment,
						{},
						false
					);

					shipping['address'] = this.translateAddress(fulfillment.shipTo);

					return_parameters['shipping'] = shipping;

					if(_.has(fulfillment, 'createDate')){
						return_parameters['created_at'] = timestamp.convertToISO8601(fulfillment.createDate);
					}

					return return_parameters;

				}

			});

			orders = arrayutilities.filter(orders, order => {
				return (!_.isNull(order) && !_.isUndefined(order));
			})

			return {orders};

		}

		throw eu.getError('server', 'Unrecognized response from ShipStation');
	}

	translateAddress(shipto){

		let native_address = objectutilities.transcribe(
			{
				line1: 'street1',
				city: 'city',
				state: 'state',
				zip: 'postalCode',
				country: 'country'
			},
			shipto,
			{}
		);

		if (shipto.street2) {
			native_address.line2 = shipto.street2;
		}

		return native_address;
	}

	translateTest(response){
		if(
			objectutilities.hasRecursive(response.body, 'fulfillments', false) ||
			objectutilities.hasRecursive(response.body, 'orders', false)
		){

			return {
				success: true,
				message: 'Successfully validated.'
			};

		}

		return {
			success: false,
			message: 'Invalid'
		};

	}

	translateFulfill(response){
		let reference_number = this.acquireReferenceNumber();

		let response_prototype = {
			success: false,
			message: 'Non-specific failure.',
			reference_number:reference_number
		};

		if(objectutilities.hasRecursive(response.body, 'orderNumber', false)){

			response_prototype.success = true;
			response_prototype.message = 'Success';

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

}

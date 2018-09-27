
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const FulfillmentProviderVendorResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');

module.exports = class TestResponse extends FulfillmentProviderVendorResponse {

	constructor(){

		super(arguments[0]);

	}

	translateResponse(response){

		du.debug('Translate Response');

		let action = this.parameters.get('action');

		let translation_methods = {
			test:'translateTest',
			info:'translateInfo',
			fulfill:'translateFulfill'
		};

		return this[translation_methods[action]](response);

	}

	translateInfo(response){

		du.debug('Translate Info');

		global.SixCRM.validate(response.body, global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/Test/responsebody.json'));

		return {
			orders: [
				{
					reference_number: response.body.response.reference_number,
					shipping: response.body.response
				}
			]
		};

	}

	translateTest(response){

		du.debug('Translate Test');

		if(!objectutilities.nonEmpty(response.body)){
			return null;
		}

		return {
			success: true,
			message: 'Successfully validated.'
		};

	}

	translateFulfill(){

		du.debug('Translate Fulfill');

		let reference_number = this.acquireReferenceNumber();

		let response_prototype = {
			success: true,
			message: 'Success',
			reference_number: reference_number
		};


		return response_prototype;

	}

	acquireReferenceNumber(fatal){

		du.debug('Acquire Reference Number');

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

	/*
  parseGetInfoResponse(response){

    du.debug('Parse Get Info Response');

    return {
      customer: this.createCustomer(order),
      shipping: this.createShippingInformation(order),
      reference_number: this.createReferenceNumber(order),
      created_at: this.createCreatedAt(order)
    };

  }
  */

}

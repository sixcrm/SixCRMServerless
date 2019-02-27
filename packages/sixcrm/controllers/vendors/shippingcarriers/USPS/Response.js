const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const xmlutilities = require('@6crm/sixcrmcore/lib/util/xml-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;

const ShippingCarrierVendorResponse = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');

module.exports = class USPSResponse extends ShippingCarrierVendorResponse {

	constructor(){

		super(arguments[0]);

		this.parameter_definition = {};

		this.parameter_validation = {
			'trackingnumber':global.SixCRM.routes.path('model','vendors/shippingcarriers/USPS/trackingnumber.json'),
			'parsedvendorresponse':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/parsedresponse.json')
		}

		this.augmentParameters();

		this.transformResponse();

	}

	transformResponse(){
		let action = this.parameters.get('action');

		let transformers = {
			'info':() => this.transformInfoResponse()
		}

		return transformers[action]();

	}

	transformInfoResponse(){
		let vendor_response = this.parameters.get('vendorresponse');

		du.warning(vendor_response);

		if(vendor_response.statusCode == 200){

			this.parseResponseXML();

			this.setTrackingNumber();
			this.setStatus();
			this.setDetail();

			this.infoResponse();

		}else{

			throw eu.getError('server', 'USPS returned a non-200 HTTP status code.');
		}

	}

	parseResponseXML(){
		let vendor_response = this.parameters.get('vendorresponse');
		let response_xml = vendor_response.body;
		let parsed_response = xmlutilities.parse(response_xml, true);

		this.parameters.set('parsedvendorresponse', parsed_response);

		return true;

	}

	setTrackingNumber(){
		let parsed_vendor_response = this.parameters.get('parsedvendorresponse');

		if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.$.ID')){
			this.parameters.set('trackingnumber', parsed_vendor_response.TrackResponse.TrackInfo[0].$.ID);
			return true;
		}

		return false;

	}

	setStatus(){
		let parsed_vendor_response = this.parameters.get('parsedvendorresponse');

		if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.TrackSummary.0')){

			let status = this.determineStatus(parsed_vendor_response.TrackResponse.TrackInfo[0].TrackSummary[0]);

			this.parameters.set('status', status);

			return true;

		}else if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.Error.0.Description.0')){

			this.parameters.set('status', 'unknown');

		}

		return false;

	}

	determineStatus(detail){
		let detail_string = null;

		if(_.isObject(detail) && _.has(detail, 'DeliveryAttributeCode')){
			if(_.isArray(detail.DeliveryAttributeCode) && arrayutilities.nonEmpty(detail.DeliveryAttributeCode)){
				return 'delivered';
			}
		}

		if(_.isNull(detail_string) && _.isObject(detail) && _.has(detail, 'Event')){

			detail_string = (_.isArray(detail.Event))?detail.Event.pop():detail.Event;

		}else if(_.isNull(detail_string) && _.isString(detail)){

			detail_string = detail;

		}

		if(stringutilities.isMatch(detail_string, /^.*delivered.*$/)){

			detail_string = 'delivered';

		}

		return this.normalizeStatus(detail_string);

	}

	normalizeStatus(status_string){
		if(_.isString(status_string)){

			if(stringutilities.isMatch(status_string, /^.*delivered.*$/)){

				return 'delivered';

			}

			if(stringutilities.isMatch(status_string, /^.*returned.*$/)){

				return 'returned';

			}

			if(stringutilities.nonEmpty(status_string)){

				return 'intransit';

			}

		}

		return 'unknown';

	}

	//Technical Debt: Refine
	setDetail(){
		let parsed_vendor_response = this.parameters.get('parsedvendorresponse');

		let detail = null;

		if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.TrackSummary.0')){

			let raw_detail = this.determineDetail(parsed_vendor_response.TrackResponse.TrackInfo[0].TrackSummary[0]);

			if(_.isString(raw_detail) && stringutilities.nonEmpty(raw_detail)){
				detail = raw_detail
			}

		}

		if(_.isNull(detail) && objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.TrackDetail.0')){

			let raw_detail = this.determineDetail(parsed_vendor_response.TrackResponse.TrackInfo[0].TrackDetail[0]);

			if(_.isString(raw_detail) && stringutilities.nonEmpty(raw_detail)){
				detail = raw_detail
			}

		}

		if(_.isNull(detail) && objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.Error.0.Description')){

			let raw_detail = this.determineDetail(parsed_vendor_response.TrackResponse.TrackInfo[0].Error[0].Description[0]);

			if(_.isString(raw_detail) && stringutilities.nonEmpty(raw_detail)){
				detail = raw_detail
			}

		}

		if(_.isNull(detail)){
			detail = 'Unknown';
		}

		this.parameters.set('detail', detail);

		return true;

	}

	//Technical Debt:  Refine
	determineDetail(detail){
		let detail_string = null;

		if(_.isObject(detail) && _.has(detail, 'Event')){
			detail_string = (_.isArray(detail.Event))?detail.Event.pop():detail.Event;
		}else if(_.isString(detail)){
			detail_string = detail;
		}

		return detail_string;

	}

	setMessage(message){
		this.parameters.set('message', message);

		return true;

	}

	getMessage(){
		return this.parameters.get('message')

	}

}

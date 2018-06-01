const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const xmlutilities = global.SixCRM.routes.include('lib', 'xml-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

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

		du.debug('Transform Response');

		let action = this.parameters.get('action');

		let transformers = {
			'info':() => this.transformInfoResponse()
		}

		return transformers[action]();

	}

	transformInfoResponse(){

		du.debug('Transform Info Response');

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

		du.debug('Parse Response XML');

		let vendor_response = this.parameters.get('vendorresponse');
		let response_xml = vendor_response.body;
		let parsed_response = xmlutilities.parse(response_xml, true);

		this.parameters.set('parsedvendorresponse', parsed_response);

		return true;

	}

	setTrackingNumber(){

		du.debug('Set Tracking Number');

		let parsed_vendor_response = this.parameters.get('parsedvendorresponse');

		if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.$.ID')){
			this.parameters.set('trackingnumber', parsed_vendor_response.TrackResponse.TrackInfo[0].$.ID);
			return true;
		}

		return false;

	}

	setStatus(){

		du.debug('Set Status');

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

		du.debug('Determine Status');

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

		return this.conformStati(detail_string);

	}

	conformStati(status_string){

		if(_.includes(['intransit', 'delivered','returned','unknown'], status_string)){
			return status_string;
		}

		du.warning('Unrecognized status: '+status_string);

		return 'intransit';

	}


	setDetail(){

		du.debug('Set Detail');

		let parsed_vendor_response = this.parameters.get('parsedvendorresponse');

		du.info(parsed_vendor_response);

		if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.TrackSummary.0')){

			let detail = this.determineDetail(parsed_vendor_response.TrackResponse.TrackInfo[0].TrackSummary[0]);

			this.parameters.set('detail', detail);

			return true;

		}else if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.Error.0.Description')){
			this.parameters.set('detail', parsed_vendor_response.TrackResponse.TrackInfo[0].Error[0].Description[0]);
			return true;
		}

		return false;

	}

	determineDetail(detail){

		du.debug('Determine Detail');

		let detail_string;

		if(_.isObject(detail) && _.has(detail, 'Event')){
			detail_string = (_.isArray(detail.Event))?detail.Event.pop():detail.Event;
		}else if(_.isString(detail)){
			detail_string = detail;
		}

		if(!_.isString(detail_string) || !stringutilities.nonEmpty(detail_string)){
			du.warning('Unrecognized shipping detail string.');
			detail_string = 'Unknown';
		}

		return detail_string;

	}

	setMessage(message){

		du.debug('Set Message');

		this.parameters.set('message', message);

		return true;

	}

	getMessage(){

		du.debug('Get Message');

		return this.parameters.get('message')

	}

}

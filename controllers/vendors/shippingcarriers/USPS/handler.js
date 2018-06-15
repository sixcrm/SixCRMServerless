
var request = require('request');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const ShippingCarrierController = global.SixCRM.routes.include('controllers', 'vendors/shippingcarriers/components/ShippingCarrier.js');

module.exports = class USPSController extends ShippingCarrierController {

	constructor(){

		super();

		this.parameter_definition = {
			info: {
				required: {
					trackingnumber: 'tracking_number'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			'trackingnumber': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/trackingnumber.json'),
			'userid': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/userid.json'),
			'requestxml': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/requestxml.json'),
			'requesturi': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/requesturi.json'),
			'vendorresponse':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/response.json')
		};

		this.augmentParameters();

		this.acquireConfigurationInformation();

	}

	acquireConfigurationInformation(){

		du.debug('Acquire Configuration Information');

		let vendor_configuration = global.SixCRM.routes.include('config', global.SixCRM.configuration.stage+'/vendors/shippingcarriers/USPS.yml');

		this.parameters.set('userid', vendor_configuration.user_id);
		//this.parameters.set('password', vendor_configuration.password);

		return true;

	}

	info(){

		du.debug('info');

		this.parameters.set('action', 'info');

		return Promise.resolve()
			.then(() => this.setParameters({argumentation: arguments[0], action: 'info'}))
			.then(() => this.acquireAPIResult())
			.then(() => this.respond({}));

	}

	acquireAPIResult(){

		du.debug('Acquire API Result');

		return Promise.resolve()
			.then(() => this.buildRequestXML())
			.then(() => this.buildRequestURI())
			.then(() => this.executeAPIRequest());

	}

	buildRequestXML(){

		du.debug('Build Request XML');

		let tracking_number = this.parameters.get('trackingnumber');
		let user_id = this.parameters.get('userid');

		//Technical Debt:  Do it this way...
		//js2xmlparser
		/*
    let prexml = {
      TrackFieldRequest:{
        '@':{
          USERID:user_id
        },
        TrackerID:{
          '@':{
            ID:tracking_number
          }
        }
      }
    };
    */

		let request_xml = '<?xml version="1.0" encoding="UTF-8" ?><TrackFieldRequest USERID="'+user_id+'"><TrackID ID="'+tracking_number+'"/></TrackFieldRequest>';

		this.parameters.set('requestxml', request_xml);

		return true;

	}

	buildRequestURI(){

		du.debug('Build URI');

		let request_xml = this.parameters.get('requestxml');

		let request_uri = 'http://production.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML='+encodeURIComponent(request_xml);

		this.parameters.set('requesturi', request_uri);

		return true;

	}

	executeAPIRequest(){

		du.debug('Execute API Request');

		let request_uri = this.parameters.get('requesturi');

		return new Promise((resolve) => {

			request(request_uri, (error, response) => {

				if(error){
					throw error;
				}

				this.parameters.set('vendorresponse', response);

				return resolve(true);

			});

		});

	}

}
/*
    parseAPIResponseBody(){

      du.debug('Parse API Response Body');

      let api_response_body = this.parameters.get('apiresponsebody');

      return new Promise((resolve) => {

        parseString(api_response_body, (error, result) => {

          if(_.isError(error)){
            throw eu.getError('server', 'Unable to parse API response body.');
          }

          this.parameters.set('parsedapiresponsebody', result);

          return resolve(true);

        });

      });

    }

    processParsedAPIResponseBody(){

      du.debug('Acquire Status From Parsed API Response Body');

      let parsedapiresponsebody = this.parameters.get('parsedapiresponsebody');

      let usps_response = parsedapiresponsebody.TrackResponse.TrackInfo[0].TrackSummary[0];

      let status = this.parseTrackSummaryMessage(usps_response);

      let delivered = (status == this.stati.delivered);

      this.parameters.set('processedparsedapiresponsebody', {
        status: status,
        message: usps_response,
        delivered: delivered
      });

      return Promise.resolve(true);

    }

    parseTrackSummaryMessage(track_summary_message){

      du.debug('Parse Track Summary Message');

      if(track_summary_message.indexOf('delivered') > -1) {

        return this.stati.delivered;

      }

      if(track_summary_message.indexOf('arrived') > -1 || track_summary_message.indexOf('departed')) {

        return this.stati.intransit;

      }

      return this.stati.unknown;

    }


    respond(){

      du.debug('Respond');

      let processed_parsed_api_response_body = this.parameters.get('processedparsedapiresponsebody');

      const ShippingProviderResponse  = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');
      let shippingProviderResponse = new ShippingProviderResponse({
        shortname: this.shortname,
        parameters: {
          delivered: processed_parsed_api_response_body.delivered,
          status: processed_parsed_api_response_body.status,
          detail: processed_parsed_api_response_body.message
        },
        result: 'success'
      });

      return shippingProviderResponse;

    }

    */

'use strict';
var _ = require('underscore');
var request = require('request');
var shippingProviderController = require('./ShippingProvider');
var parseString = require('xml2js').parseString;

class USPSController extends shippingProviderController {

    constructor(){

        super();

    }

    buildURI(tracking_number){

        var request_xml = this.buildRequestXML(tracking_number);

        return 'http://production.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML='+encodeURIComponent(request_xml);

    }

    buildRequestXML(tracking_number){

        return '<?xml version="1.0" encoding="UTF-8" ?><TrackFieldRequest USERID="'+process.env.usps_user_id+'"><TrackID ID="'+tracking_number+'"/></TrackFieldRequest>';

    }

    isDelivered(tracking_number){
        return this.getStatus(tracking_number).then((status) => {
            if(_.has(status, 'parsed_status')){
                if(status.parsed_status == this.stati.delivered){
                    return true;
                }
            }
            return false;
        });
    }

    getStatus(tracking_number){

        var controller_instance = this;

        return new Promise((resolve, reject) => {

            var request_uri = this.buildURI(tracking_number);

            request(request_uri, function (error, response, body) {

			  if (!error && response.statusCode == 200) {

      parseString(body, function (err, result) {

          if(_.isError(err)){ reject(error); }

    				if(!_.has(result, 'TrackResponse') || !_.has(result.TrackResponse, 'TrackInfo')){ reject(new Error('Unexpected response from USPS.')); }

          var usps_response = result.TrackResponse.TrackInfo[0].TrackSummary[0].Event[0];

          if(_.isString(usps_response)){

              var parsed_status = controller_instance.parseTrackSummaryMessage(usps_response);

              resolve({parsed_status: parsed_status, message: usps_response});

          }else{

              reject(new Error('Unexpected response from USPS.'));

          }

      });

			  }
            });

        });

    }

    parseTrackSummaryMessage(usps_response){

        if(usps_response.indexOf('delivered') > -1) {

            return this.stati.delivered;

        }

        if(usps_response.indexOf('arrived') > -1 || usps_response.indexOf('departed')) {

            return this.stati.intransit;

        }

        return this.stati.unknown;

    }

}

module.exports = new USPSController();
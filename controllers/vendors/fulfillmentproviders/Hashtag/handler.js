'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider');

class HashtagController extends fulfillmentProviderController {

  constructor({fulfillment_provider}){

    super(arguments[0]);

    this.parameter_validation = {

    };

    this.parameter_definition = {

    };

    // Technical Debt: Read this from config.
    this.wsdl = 'https://secure-wms.com/webserviceexternal/contracts.asmx?wsdl';

    const SoapUtilities = global.SixCRM.routes.include('lib', 'soap-utilities.js');

    this.soaputilities = new SoapUtilities({wsdl: this.wsdl});

  }

    triggerFulfillment(){

        du.debug('Trigger fulfillment in Hashtag.');

        // Technical Debt: Finish, probably using this:
        // https://secure-wms.com/webserviceexternal/contracts.asmx?op=CreateOrders

    }

    testConnection({username, password, threepl_id, threepl_key, facility_id, customer_id}) {

        du.debug('Test connection.');

        return this.soaputilities.executeMethod({
            name: 'FindOrders',
            parameters: {
                ThreePLID: threepl_id,
                ThreePLKey: threepl_key,
                Login: username,
                Password: password,
                FacilityID: facility_id,
                CustomerID: customer_id
            }
        }).catch(error => {
            return { error_message: error.message }
        });
    }

}

module.exports = new HashtagController();

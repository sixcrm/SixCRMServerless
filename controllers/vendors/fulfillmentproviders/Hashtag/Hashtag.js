'use strict';
const SoapUtilities = global.SixCRM.routes.include('lib', 'soap-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider');

class HashtagController extends fulfillmentProviderController {

    constructor(){

        super();

        // Technical Debt: Read this from config.
        this.wsdl = 'https://secure-wms.com/webserviceexternal/contracts.asmx?wsdl';
        this.soap = new SoapUtilities({wsdl: this.wsdl});
    }

    triggerFulfillment(){

        du.debug('Trigger fulfillment in Hashtag.');

        // Technical Debt: Finish, probably using this:
        // https://secure-wms.com/webserviceexternal/contracts.asmx?op=CreateOrders

    }

    testConnection({login, password, threepl_id, facility_id, customer_id}) {

        du.debug('Test connection.');

        return this.soap.executeMethod({
            name: 'FindOrders',
            parameters: {
                ThreePLID: threepl_id,
                Login: login,
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

'use strict';

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

var USPSController = global.SixCRM.routes.include('controllers', 'vendors/shippingproviders/USPS.js');

class shippingStatusController {

    constructor(){

    }

    isDelivered(provider, tracking_number){

        switch(provider){

        case 'usps':

            return USPSController.isDelivered(tracking_number).then((delivered) => {

                return delivered === true;

            });

        default:

            eu.throwError('server','Unknown shipping provider: '+provider);

        }

    }

    getStatus(provider, tracking_number){

        switch(provider){

        case 'usps':

            return USPSController.getStatus(tracking_number);

        default:

            eu.throwError('not_implemented','Unknown shipping provider: '+provider);

        }

    }

}

module.exports = new shippingStatusController();

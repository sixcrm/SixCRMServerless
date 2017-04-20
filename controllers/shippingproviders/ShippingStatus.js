'use strict';
var USPSController = require('./USPS.js');

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
            return Promise.reject(new Error('Unknown shipping provider: '+provider));
        }

    }

    getStatus(provider, tracking_number){

        switch(provider){

        case 'usps':

            return USPSController.getStatus(tracking_number);

        default:
            throw new Error('Unknown shipping provider: '+provider);
        }

    }

}

module.exports = new shippingStatusController();
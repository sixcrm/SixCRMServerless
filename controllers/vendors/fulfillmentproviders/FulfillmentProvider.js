'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class fulfillmentProviderController {

    constructor({fulfillment_provider}){

      //parameters
        //this.stati = {success: "NOTIFIED", noship: "NOSHIP", error: "NOTIFICATIONERROR", failed: "FAILED"};
    }

    triggerFulfillment(){

        du.warning('Trigger fulfillment in base class. NOT IMPLEMENTED.');

        return Promise.resolve(this.stati.success);

    }

    testConnection() {

        du.warning('Test connection in base class. NOT IMPLEMENTED.');

        return Promise.resolve(this.stati.success);
    }

    validate() {

      du.debug('Validate');

      return null;

    }

};

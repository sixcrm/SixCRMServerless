'use strict';
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class ShippingStatusController {

    constructor(){

      this.parameter_definition = {
        getStatus:{
          required:{
            shippingreceipt:'shipping_receipt'
          },
          optional:{}
        },
        isDelivered:{
          required:{
            shippingreceipt:'shipping_receipt'
          },
          optional:{}
        }
      };

      this.parameter_validation = {
        'shippingreceipt': global.SixCRM.routes.path('model','entities/shippingreceipt.json'),
        'trackerresponse': global.SixCRM.routes.path('model','providers/tracker/responses/info.json')
      };

      const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

      this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

    }

    isDelivered({shipping_receipt}){

      du.debug('Is Delivered');

      return this.getStatus(arguments[0])
      .then(result => {
        return (result.status == 'delivered');
      });

    }

    getStatus({shipping_receipt}){

      du.debug('Get Status');

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'getStatus'}))
      .then(() => this.getCarrierStatus())
      .then(() => {

        this.updateShippingReceiptHistory();

        return this.parameters.get('trackerresponse');

      });

    }

    updateShippingReceiptHistory(){

      du.debug('Update Shipping Receipt History');

      let tracker_response = this.parameters.get('trackerresponse');
      let shipping_receipt = this.parameters.get('shippingreceipt');

      if(!_.has(this, 'shippingReceiptHelperController')){
        this.shippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');
      }

      return this.shippingReceiptHelperController.updateShippingReceipt({
        shipping_receipt: shipping_receipt,
        detail: tracker_response.detail,
        status: tracker_response.status
      }).then(result => {
        this.parameters.set('shippingreceipt', result);
        return true;
      });

    }

    getCarrierStatus(){

      du.debug('Get Carrier Status');

      let shipping_receipt = this.parameters.get('shippingreceipt');

      let TrackerController = global.SixCRM.routes.include('providers','tracker/Tracker.js');
      let trackerController = new TrackerController();

      return trackerController.info({shipping_receipt: shipping_receipt}).then(result => {

        this.parameters.set('trackerresponse', result);

        return true;

      });

    }

}

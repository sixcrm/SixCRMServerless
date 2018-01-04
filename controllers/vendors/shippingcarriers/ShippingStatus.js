'use strict';
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

class ShippingStatusController {

    constructor(){

      this.carriers = {
        usps: () => this.getUSPSStatus()
      }

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
        'shippingcarrier': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/shippingcarrier.json'),
        'shippingproviderresponse': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/response.json'),
        'trackingnumber': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/trackingnumber.json')
      };

      const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

      this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

    }

    isDelivered({shipping_receipt}){

      du.debug('Is Delivered');

      return this.getStatus(arguments[0])
      .then(result => {
        return result.getDelivered();
      });

    }

    getStatus({shipping_receipt}){

      du.debug('Get Status');

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'getStatus'}))
      .then(() => this.getCarrierStatus())
      .then(() => {

        this.updateShippingReceiptHistory();

        return this.parameters.get('shippingproviderresponse');

      });

    }

    updateShippingReceiptHistory(){

      du.debug('Update Shipping Receipt History');

      let shipping_provider_response = this.parameters.get('shippingproviderresponse');
      let shipping_receipt = this.parameters.get('shippingreceipt');

      let status = shipping_provider_response.getStatus();
      let detail = shipping_provider_response.getDetail();

      if(!_.has(this, 'shippingReceiptHelperController')){
        this.shippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');
      }

      return this.shippingReceiptHelperController.updateShippingReceipt({
        shipping_receipt: shipping_receipt,
        detail: detail,
        status: status
      }).then(result => {
        this.parameters.set('shippingreceipt', result);
        return true;
      });

    }

    getCarrierStatus(){

      du.debug('Get Carrier Status');

      let carrier = this.parameters.get('shippingcarrier');

      if(!_.has(this.carriers, carrier)){
        eu.throwError('server', 'Unknown shipping carrier: '+carrier);
      }

      return this.carriers[carrier]();

    }

    getTrackingNumber(){

      du.debug('Get Tracking Number');

      let shipping_receipt = this.parameters.get('shippingreceipt');

      if(!_.has(this, 'shippingReceiptHelperController')){
        this.shippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');
      }

      let tracking_number = this.shippingReceiptHelperController.getTrackingNumber(shipping_receipt);

      this.parameters.set('trackingnumber', tracking_number);

      return true;

    }

    /*
    getUSPSStatus(){

      du.debug('Get USPS Status');

      return Promise.resolve()
      .then(() => this.getTrackingNumber())
      .then(() => {

        let tracking_number = this.parameters.get('trackingnumber');
        let USPSController = global.SixCRM.routes.include('controllers', 'vendors/shippingcarriers/USPS/handler.js');

        return USPSController.getStatus(tracking_number).then(result => {
          this.parameters.set('shippingproviderresponse', result);
          return true;
        });

      });

    }
    */

}

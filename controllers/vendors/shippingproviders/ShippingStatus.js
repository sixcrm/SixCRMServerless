'use strict';
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

class ShippingStatusController {

    constructor(){

      this.providers = {
        usps: () => this.getUSPSStatus()
      }

      this.parameter_definition = {
        getStatus:{
          required:{
            shippingprovider:'shipping_provider',
            shippingreceipt:'shipping_receipt'
          },
          optional:{}
        },
        isDelivered:{
          required:{
            shippingprovider:'shipping_provider',
            shippingreceipt:'shipping_receipt'
          },
          optional:{}
        }
      };

      this.parameter_validation = {
        'shippingreceipt': global.SixCRM.routes.path('model','entities/shippingreceipt.json'),
        'shippingprovider': global.SixCRM.routes.path('model', 'vendors/shippingproviders/shippingprovider.json'),
        'shippingproviderresponse': global.SixCRM.routes.path('model', 'vendors/shippingproviders/response.json'),
        'trackingnumber': global.SixCRM.routes.path('model', 'vendors/shippingproviders/trackingnumber.json')
      };

      const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

      this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

    }

    isDelivered({shipping_provider, shipping_receipt}){

      du.debug('Is Delivered');

      return this.getStatus(arguments[0])
      .then(result => {
        return result.getDelivered();
      });

    }

    getStatus({shipping_provider, shipping_receipt}){

      du.debug('Get Status');

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'getStatus'}))
      .then(() => this.getProviderStatus())
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

    getProviderStatus(){

      du.debug('Get Provider Status');

      let provider = this.parameters.get('shippingprovider');

      if(!_.has(this.providers, provider)){
        eu.throwError('server', 'Unknown shipping provider: '+provider);
      }

      return this.providers[provider]();

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

    getUSPSStatus(){

      du.debug('Get USPS Status');

      return Promise.resolve()
      .then(() => this.getTrackingNumber())
      .then(() => {

        let tracking_number = this.parameters.get('trackingnumber');
        let USPSController = global.SixCRM.routes.include('controllers', 'vendors/shippingproviders/USPS/handler.js');

        return USPSController.getStatus(tracking_number).then(result => {
          this.parameters.set('shippingproviderresponse', result);
          return true;
        });

      });

    }

}

module.exports = new ShippingStatusController();

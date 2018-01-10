'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const ShipmentUtilities = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');

module.exports = class InfoController extends ShipmentUtilities {

  constructor(){

    super();

    this.parameter_validation = {
      'shippingreceipt':global.SixCRM.routes.path('model', 'entities/shippingreceipt.json'),
      'vendorresponseclass':global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/response/responseclass.json')
    };

    this.parameter_definition = {
      execute:{
        required:{
          shippingreceipt:'shipping_receipt'
        },
        optional:{}
      }
    };

    this.response_validation = global.SixCRM.routes.path('model', 'providers/shipping/terminal/responses/info.json');

    this.augmentParameters();

  }

  execute({shipping_receipt}){

    du.debug('Execute');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'execute'}))
    .then(() => this.hydrateShippingReceiptProperties())
    .then(() => this.instantiateFulfillmentProviderClass())
    .then(() => this.executeInfo())
    .then(() => this.validateResponse())
    .then(() => this.pruneResponse())
    .then(() => {
      return this.parameters.get('vendorresponseclass');
    });

  }

  executeInfo(){

    du.debug('Execute Info');

    let instantiated_fulfillment_provider = this.parameters.get('instantiatedfulfillmentprovider');
    let shipping_receipt = this.parameters.get('shippingreceipt');

    return instantiated_fulfillment_provider.info({shipping_receipt: shipping_receipt}).then(vendorresponseclass =>{

      this.parameters.set('vendorresponseclass', vendorresponseclass);

      return true;

    });

  }

}

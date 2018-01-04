'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const ShippingCarrierUtilities = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingCarrierUtilities.js');

module.exports = class InfoController extends ShippingCarrierUtilities {

  constructor(){

    super();

    this.parameter_validation = {
      'shippingreceipt':global.SixCRM.routes.path('model', 'entities/shippingreceipt.json'),
      'vendorresponseclass':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/response/responseclass.json')
    };

    this.parameter_definition = {
      execute:{
        required:{
          shippingreceipt:'shipping_receipt'
        },
        optional:{}
      }
    };

    this.response_validation = global.SixCRM.routes.path('model', 'providers/tracker/responses/info.json');

    this.augmentParameters();

  }

  execute({shipping_receipt}){

    du.debug('Execute');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'execute'}))
    .then(() => this.instantiateShippingCarrierProviderClass())
    .then(() => this.executeInfo())
    .then(() => this.validateResponse())
    .then(() => this.pruneResponse())
    .then(() => {
      return this.parameters.get('vendorresponseclass');
    });

  }

  executeInfo(){

    du.debug('Execute Fulfillment');

    let instantiated_shipping_carrier_provider = this.parameters.get('instantiatedshippingcarrierprovider');
    let shipping_receipt = this.parameters.get('shippingreceipt');

    return instantiated_shipping_carrier_provider.info({tracking_number: shipping_receipt.tracking.id}).then(vendorresponseclass =>{

      this.parameters.set('vendorresponseclass', vendorresponseclass);

      return true;

    });

  }

}

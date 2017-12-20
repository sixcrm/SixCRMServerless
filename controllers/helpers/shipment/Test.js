'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const ShipmentUtilities = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');

module.exports = class TestController extends ShipmentUtilities {

  constructor(){

    super();

    this.parameter_validation = {
      'providerresponse':global.SixCRM.routes.path('model', 'providers/shipping/terminal/providerresponse.json')
    };

    this.parameter_definition = {
      execute:{
        required:{
          fulfillmentproviderid:'fulfillment_provider_id'
        },
        optional:{}
      }
    };

    this.augmentParameters();

  }

  execute({fulfillment_provider_id}){

    du.debug('Fulfill');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'execute'}))
    .then(() => this.hydrateFulfillmentProvider())
    .then(() => this.instantiateFulfillmentProviderClass())
    .then(() => this.executeTest())
    .then(() => {
      return this.parameters.get('providerresponse');
    });

  }

  executeTest(){

    du.debug('Execute Fulfillment');

    let instantiated_fulfillment_provider = this.parameters.get('instantiatedfulfillmentprovider');

    return instantiated_fulfillment_provider.test().then(providerresponse =>{

      du.info(providerresponse); process.exit();
      this.parameters.set('providerresponse', providerresponse);

      return true;

    });

  }

}

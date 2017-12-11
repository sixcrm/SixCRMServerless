'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const ShipmentUtilities = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');

module.exports = class FulfillController extends ShipmentUtilities {

  constructor(){

    super();

    this.parameter_validation = {
      'providerresponse':global.SixCRM.routes.path('model', 'providers/shipping/terminal/providerresponse.json')
    };

    this.parameter_definition = {
      execute:{
        required:{
          fulfillmentproviderid:'fulfillment_provider_id',
          augmentedtransactionproducts: 'augmented_transaction_products'
        },
        optional:{}
      }
    };

    this.augmentParameters();

  }

  execute({fulfillment_provider_id, augmented_transaction_products}){

    du.debug('Fulfill');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'execute'}))
    .then(() => this.hydrateRequestProperties())
    .then(() => this.instantiateFullfillmentProviderClass())
    .then(() => this.executeFulfillment())
    .then(() => {
      return this.parameters.get('providerresponse');
    });

  }

  hydrateRequestProperties(){

    du.debug('Hydrate Request Properties');

    let promises = [
      this.hydrateFulfillmentProvider(),
      this.hydrateAugmentedTransactionProducts(),
      this.acquireCustomer()
    ];

    return Promise.all(promises).then(promises => {

      return true;

    });

  }

  hydrateAugmentedTransactionProducts(){

    du.debug('Hydrate Augmented Transaction Products');

    return this.hydrateProducts()
    .then(() => this.marryProductsToAugmentedTransactionProducts());

  }

  executeFulfillment(){

    du.debug('Execute Fulfillment');

    let instantiated_fulfillment_provider = this.parameters.get('instantiatedfulfillmentprovider');
    let hydrated_augmented_transaction_products = this.parameters.get('hydratedaugmentedtransactionproducts');
    let customer = this.parameters.get('customer');

    return instantiated_fulfillment_provider.fulfill({customer: customer, products: hydrated_augmented_transaction_products}).then(providerresponse =>{

      this.parameters.set('providerresponse', providerresponse);

      return true;

    });

  }

}

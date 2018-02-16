'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

module.exports = class MerchantProviderSummaryHelperController {

  constructor(){

    this.parameter_definition = {
      incrementMerchantProviderSummary:{
        required:{
          merchantproviderid:'merchant_provider',
          day:'day',
          type:'type',
          total:'total'
        },
        optional:{}
      }
    };

    this.parameter_validation = {
      'merchantproviderid':global.SixCRM.routes.path('model','definitions/uuidv4.json'),
      'merchantprovidersummary':global.SixCRM.routes.path('model', 'entities/merchantprovidersummary.json'),
      'day':global.SixCRM.routes.path('model','definitions/iso8601.json'),
      'type':global.SixCRM.routes.path('model','definitions/sixcrmtransactiontype.json'),
      'total':global.SixCRM.routes.path('model','definitions/currency.json'),
      'summary':global.SixCRM.routes.path('model','entities/merchantprovidersummary.json')
    };

    const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

    this.merchantProviderSummaryController = global.SixCRM.routes.include('entities', 'MerchantProviderSummary.js');

  }

  incrementMerchantProviderSummary({merchant_provider, day, type, total}){

    du.debug('Increment Merchant Provider Summary');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'incrementMerchantProvider'}))
    .then(() => this.validateDay())
    .then(() => this.getMerchantProviderSummary())
    .then(() => this.incrementSummary());

  }

  validateDay(){

    du.debug('Validate Day');

    let day = this.parameters.get('day');

    if(!timestamp.isToday(day, 10)){
      eu.throwError('server','You may not increment a merchant provider summary for a day other than today.');
    }

    return true;

  }

  getMerchantProviderSummary({merchant_provider, day, type}){

    du.debug('Get Merchant Provider Summary');

    let start = timestamp.startOfDay(day);
    let end = timestamp.endOfDay(day);

    return this.merchantProviderSummaryController.listByMerchantProviderAndDateRange({merchant_providers:[merchant_provider], start:start, end:end, type: type})
    .then((result) => this.merchantProviderSummaryController.getResult(result))
    .then(result => {

      if(!_.isNull(result)){
        this.parameters.set('merchantprovidersummary', result);
        return true;
      }

      let merchant_provider_summary_prototype = this.createPrototype({merchant_provider: merchant_provider, day: day, type: type});

      return this.merchantProviderSummaryController.create({entity: merchant_provider_summary_prototype}).then(result => {
        this.parameters.set('merchantprovidersummary', result);
        return true;
      });

    });

  }

  createPrototype({merchant_provider, day, type}){

    du.debug('Create Prototype');

    return {
      merchant_provider: merchant_provider,
      day: day,
      total: 0.0,
      count: 0,
      type: type
    };

  }

  incrementSummary(){

    du.debug('Increment Summary');

    let merchant_provider_summary = this.parameters.get('merchantprovidersummary');
    let total = this.parameters.get('total');

    merchant_provider_summary.total = merchant_provider_summary.total + numberutilities.formatFloat(total);
    merchant_provider_summary.count = merchant_provider_summary.count + 1;

    return this.merchantProviderSummaryController.update({entity: merchant_provider_summary}).then(result => {
      this.parameters.set('merchantprovidersummary', result);
      return true;
    });

  }


}

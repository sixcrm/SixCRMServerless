'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class ShippingReceiptHelperController {

  constructor(){

    this.parameter_definition = {
      updateShippingReceipt:{
        required:{
          shippingreceipt:'shipping_receipt',
          shippingdetail:'detail',
          shippingstatus:'status'
        },
        optional:{}
      }
    };

    this.parameter_validation = {
      'shippingreceipt': global.SixCRM.routes.path('model','entities/shippingreceipt.json'),
      'shippingdetail': global.SixCRM.routes.path('model', 'vendors/shippingproviders/response/detail.json'),
      'shippingstatus': global.SixCRM.routes.path('model', 'vendors/shippingproviders/response/status.json'),
      'updatedshippingreceipt': global.SixCRM.routes.path('model', 'entities/shippingreceipt.json')
    };

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

  }

  getTrackingNumber(shipping_receipt, fatal){

    du.debug('Get Tracking Number');

    fatal = (_.isUndefined(fatal))?false:fatal;

    if(_.has(shipping_receipt, 'trackingnumber')){
      return shipping_receipt.trackingnumber;
    }

    if(fatal == true){
      eu.throwError('server', 'Shipping Receipt missing property "trackingnumber"');
    }

    return null;

  }

  updateShippingReceipt({shipping_receipt, detail, status}){

    du.debug('Update Shipping Receipt');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'updateShippingReceipt'}))
    .then(() => this.acquireShippingReceipt())
    .then(() => this.buildUpdatedShippingReceiptPrototype())
    .then(() => this.pushUpdatedShippingReceipt())
    .then(() => {
      return this.parameters.get('updatedshippingreceipt');
    });

  }

  acquireShippingReceipt(){

    du.debug('Acquire Shipping Receipt');

    let shipping_receipt = this.parameters.get('shippingreceipt');

    if(!_.has(this, 'shippingReceiptController')){
      this.shippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
    }

    return this.shippingReceiptController.get({id: shipping_receipt.id}).then(shipping_receipt => {

      this.parameters.set('shippingreceipt', shipping_receipt);

      return true;

    });

  }

  pushUpdatedShippingReceipt(){

    du.debug('Update Shipping Receipt History');

    let updated_shipping_receipt = this.parameters.get('updatedshippingreceipt');

    if(!_.has(this, 'shippingReceiptController')){
      this.shippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
    }

    return this.shippingReceiptController.update({entity: updated_shipping_receipt}).then(updated_shipping_receipt => {
      this.parameters.set('updatedshippingreceipt', updated_shipping_receipt);
      return true;
    });

  }

  buildUpdatedShippingReceiptPrototype(){

    du.debug('Build Updated Shipping Receipt Prototype');

    let shipping_receipt = this.parameters.get('shippingreceipt');
    let shipping_status = this.parameters.get('shippingstatus');
    let shipping_detail = this.parameters.get('shippingdetail');

    let history_object = {
      updated_at: timestamp.getISO8601(),
      detail: shipping_detail
    };

    if(!_.has(shipping_receipt, 'history')){
      shipping_receipt.history = [history_object];
    }else{
      shipping_receipt.history = arrayutilities.merge(shipping_receipt.history, [history_object]);
    }

    shipping_receipt.trackingstatus = shipping_status;
    shipping_receipt.status = shipping_status;

    this.parameters.set('updatedshippingreceipt', shipping_receipt);

    return true;

  }

}

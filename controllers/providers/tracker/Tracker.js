'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

const InfoController = global.SixCRM.routes.include('helpers', 'shippingcarriers/Info.js');
const TrackerUtilities = global.SixCRM.routes.include('providers', 'tracker/TrackerUtilities.js');

module.exports = class TrackerController extends TrackerUtilities {

  constructor(){

    super();

  }

  info({shipping_receipt}){

    du.debug('info');

    return Promise.resolve(true)
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'info'}))
    .then(() => this.acquireShippingReceipt())
    .then(() => this.executeInfo())
    .then(() => this.transformInfoResponse())
    .then(() => this.respond());

  }

  executeInfo(){

    du.debug('Execute Info');

    let shipping_receipt = this.parameters.get('shippingreceipt');

    let infoController = new InfoController();

    return infoController.execute({shipping_receipt: shipping_receipt}).then(result => {
      this.parameters.set('vendorresponseclass', result);
      return true;
    });

  }

  transformInfoResponse(){

    du.debug('Transform Info Response');

    let vendor_response = this.parameters.get('vendorresponseclass');

    let responsecode = 'fail';

    if(vendor_response.getCode() == 'success' && vendor_response.getMessage() == 'Success'){
      responsecode = 'success';
    }else if(vendor_response.getCode() == 'error'){
      responsecode = 'error';
    }

    this.parameters.set('responsecode', responsecode);

    return true;

  }

}

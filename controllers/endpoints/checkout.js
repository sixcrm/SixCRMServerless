'use strict';
const _ = require("underscore");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const modelvalidationutilities = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/transaction.js');
const createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
const createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
const confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

class checkoutController extends transactionEndpointController{

    constructor(){
      super();
    }

    execute(event){

      du.debug('Execute');

      return this.acquireBody(event)
  		.then((body) => this.validateInput(body, this.validateEventSchema))
      .then(() => this.createLead(event))
      .then((lead_response) => {

        if(!_.has(lead_response, 'id')){
          eu.throwError('server', 'Unable to establish session ID.');
        }

        event['queryStringParameters'] = 'session='+lead_response.id;

        if(_.isString(event.body)){
          event.body = JSON.parse(event.body);
        }

        event.body['session'] = lead_response.id;

      })
      .then(() => this.createOrder(event))
      .then(() => this.confirmOrder(event))
  		.then((pass_through) => this.handleNotifications(pass_through))
  		.catch((error) => {
        du.error(error);
        throw error;
      });

    }

    confirmOrder(event){

      du.debug('Confirm Order');

      return confirmOrderController.execute(event);

    }

    createOrder(event){

      du.debug('Create Order');

      return createOrderController.execute(event);

    }

    createLead(event){

      du.debug('Create Lead');

      return createLeadController.execute(event);

    }

    validateEventSchema(event){

        du.debug('Validate Event Schema');

        return modelvalidationutilities.validateModel(event,  global.SixCRM.routes.path('model', 'endpoints/checkout.json'));

    }

}

module.exports = new checkoutController();

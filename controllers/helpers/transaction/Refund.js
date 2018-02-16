'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const TransactionUtilities = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');

//Technical Debt:  Look at disabling and enabling ACLs here...
module.exports = class Refund extends TransactionUtilities{

    constructor(){

      super();

      this.parameter_definitions = {
        required:{
          transaction: 'transaction'
        },
        optional:{
          amount: 'amount'
        }
      };

      this.parameter_validation = {
        'refund': global.SixCRM.routes.path('model','transaction/refund.json'),
        'transaction': global.SixCRM.routes.path('model','transaction/transaction.json'),
        'merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
        'selected_merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
        'amount':global.SixCRM.routes.path('model','transaction/amount.json')
      };

      this.transactionController = global.SixCRM.routes.include('entities','Transaction.js');

      this.instantiateParameters();

    }

    refund(parameters){

      du.debug('Refund');

      return this.setParameters(parameters)
      .then(() => this.hydrateParameters())
      .then(() => this.refundTransaction());

    }

    //Technical Debt: Untested...
    refundTransaction(){

      du.debug('Process Transaction');

      return this.instantiateGateway()
      .then(() => this.createProcessingParameters())
      .then(() => {

        let instantiated_gateway = this.parameters.get('instantiated_gateway');
        let processing_parameters = this.parameters.get('refund');

        return instantiated_gateway.refund(processing_parameters);

      });

    }

    createProcessingParameters(){

      du.debug('Create Processing Parameters');

      let transaction = this.parameters.get('transaction');

      if(_.has(transaction, 'processor_response')){

        try{
          transaction.processor_response = JSON.parse(transaction.processor_response);
        }catch(error){
          //no biggie
        }

      }

      let parameters = {
        transaction: transaction
      };

      let amount = this.parameters.get('amount', null, false);

      if(!_.isNull(amount)){
        parameters.amount = amount;
      }

      this.parameters.set('refund', parameters);

      return Promise.resolve(parameters);

    }

    //Technical Debt: Add Amount
    hydrateParameters(){

      du.debug('Hydrate Parameters');

      let transaction = this.parameters.get('transaction');

      return this.transactionController.get({id: transaction})
      .then((transaction) => {

        return this.transactionController.getMerchantProvider(transaction);

      })
      .then((merchantprovider) => {

        this.parameters.set('selected_merchantprovider', merchantprovider);

        return true;

      });

    }

}

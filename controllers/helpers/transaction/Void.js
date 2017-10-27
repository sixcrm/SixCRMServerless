'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const TransactionUtilities = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');

//Technical Debt:  Look at disabling and enabling ACLs here...
module.exports = class Void extends TransactionUtilities{

    constructor(){

      super();

      this.parameter_definitions = {
        required:{
          transaction: 'transaction'
        },
        optional:{}
      };

      this.parameter_validation = {
        'void': global.SixCRM.routes.path('model','transaction/void.json'),
        'transaction': global.SixCRM.routes.path('model','transaction/transaction.json'),
        'merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
        'selected_merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
        'amount':global.SixCRM.routes.path('model','transaction/amount.json')
      };

      this.transactionController = global.SixCRM.routes.include('entities','Transaction.js');

      this.instantiateParameters();

    }

    void(parameters){

      du.debug('Void');

      return this.setParameters(parameters)
      .then(() => this.hydrateParameters())
      .then(() => this.voidTransaction());

    }

    //Technical Debt: Untested...
    voidTransaction(){

      du.debug('Process Transaction');

      return this.instantiateGateway()
      .then(() => this.createProcessingParameters())
      .then(() => {

        let instantiated_gateway = this.parameters.get('instantiated_gateway');
        let processing_parameters = this.parameters.get('void');

        return instantiated_gateway.void(processing_parameters);

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

      this.parameters.set('void', parameters);

      return Promise.resolve(parameters);

    }

    hydrateParameters(){

      du.debug('Hydrate Parameters');

      let transaction = this.parameters.get('transaction');

      //Technical Debt:  I don't like this.
      this.transactionController.disableACLs();
      return this.transactionController.get({id: transaction})
      .then((transaction) => {

        this.parameters.set('transaction', transaction);

        return this.transactionController.getMerchantProvider(transaction);

      })
      .then((merchantprovider) => {

        this.transactionController.enableACLs();
        this.parameters.set('selected_merchantprovider', merchantprovider);

        return true;

      });

    }

}

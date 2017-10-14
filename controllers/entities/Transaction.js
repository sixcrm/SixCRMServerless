'use strict';
const _ = require('underscore');
var random = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class transactionController extends entityController {

    constructor(){
        super('transaction');
    }

    associatedEntitiesCheck({id}){
      return Promise.resolve([]);
      /*
      if(id == '3e0fda0a-a64b-4752-bed8-152a98285be7'){
        return Promise.resolve([]);
      }
      eu.throwError('403', 'Transactions are not available for deletion via the SixCRM API.');
      */
    }

    listByMerchantProviderID({id, pagination}){

      du.debug('List By Merchant Provider ID');

      return this.listByAssociation({field: 'merchant_provider', id: id, pagination: pagination});

    }

    //Technical Debt:  This is pretty complicated.
    listByProductID({id, pagination}){

      du.debug('List By Product ID');

      //this should return a array of transactions that reference a given product_id
      return null;

    }

	//Technical Debt:  Why is this missing rebills
    getParentRebill(transaction){

      du.debug('Get Parent Rebill');

      if(_.has(transaction, 'rebill')){

        return this.executeAssociatedEntityFunction('rebillController', 'get', {id: this.getID(transaction.rebill)});

      }

      return null;

    }

    getProduct(product){

      du.debug('Get Product');

      return this.executeAssociatedEntityFunction('productController', 'get', {id: this.getID(product)});

    }

    //Technical Debt:  Refactor name
    getTransactionProducts(transaction){

      du.debug('Get Transaction Products');

      let return_array = [];

      arrayutilities.map(transaction.products, (transactionproduct) => {

        if(_.has(transactionproduct, 'amount') && _.has(transactionproduct, 'product')){

          let base_product = {
              "amount": transactionproduct.amount,
              "product": transactionproduct.product
          };

          if(_.has(transactionproduct, "shippingreceipt")){
              base_product['shippingreceipt'] = transactionproduct.shippingreceipt;
          }

          return_array.push(base_product);

        }

      });

      if(arrayutilities.nonEmpty(return_array)){
        return return_array;
      }

      return null;

    }

    //Technical Debt: Refactor.
    getTransactionProduct(transaction_product){

        du.debug('Get Transaction Product');

        var promises = [];

        if(_.has(transaction_product, "product")){

          promises.push(this.executeAssociatedEntityFunction('productController', 'get', {id: transaction_product.product}));

        }else{

          return null;

        }

        if(_.has(transaction_product, "shippingreceipt")){

            var getShippingReceipt = this.executeAssociatedEntityFunction('shippingReceiptController', 'get', {id: transaction_product.shippingreceipt});

            promises.push(getShippingReceipt);
        }

        return Promise.all(promises).then((promises) => {

            transaction_product['product'] = promises[0];

            if(_.has(transaction_product, 'shippingreceipt')){
                transaction_product['shippingreceipt'] = promises[1];
            }

            return transaction_product;

        });

    }

    //Technical Debt:  Refactor
    getProducts(transaction){

        du.debug('Get Products');

        du.info(transaction);
        if(!_.has(transaction, "products")){ return null; }


        du.debug('Transaction Products', transaction.products);

        return Promise.all(transaction.products.map(transaction_product => this.getTransactionProduct(transaction_product)));

    }

    listTransactionsByRebillID({id}){

      du.debug('List Transactions By Rebill ID');

      //Technical Debt: this is silly but necessary ATM
      id = this.getID(id);

      return this.queryBySecondaryIndex({field: 'rebill', index_value: id, index_name: 'rebill-index'}).then((result) => this.getResult(result));

    }

    putTransaction(params, processor_response){

        du.debug('Put Transaction');

        return this.executeAssociatedEntityFunction('rebillController', 'get', {id: params.rebill}).then((rebill) => {

          params.rebill = rebill;

          var transaction = this.createTransactionObject(params, processor_response);

          return this.create({entity: transaction});

        });

    }

    createTransactionObject(parameters, processor_response){

        du.debug('Create Transaction Object');

        //Technical Debt: Why is this necessary?
        let merchant_provider = this.getMerchantProvider(parameters, processor_response);

        var return_object = {
            rebill: parameters.rebill.id,
            processor_response: JSON.stringify(processor_response),
            amount: parameters.amount,
            products: parameters.products,
            alias: this.createAlias(),
            merchant_provider: merchant_provider
        };

        return return_object;

    }

    getMerchantProvider(parameters, processor_response){

        du.debug('Get Merchant Provider');

        if(_.has(parameters, 'merchant_provider') && this.isUUID(parameters.merchant_provider)){
            return parameters.merchant_provider;
        }

        if(_.has(processor_response, 'merchant_provider') && this.isUUID(processor_response.merchant_provider)){
            return processor_response.merchant_provider;
        }

        return null;

    }

    createAlias(){

        let alias = random.createRandomString(9);

        return 'T'+alias;

    }

    validateRefund(refund, transaction){

        //Technical Debt:  This should be, uh more rigorous...
        //make sure that the transaction was successful

        if(refund.amount > transaction.amount){
            eu.throwError('validation', 'Refund amount is greater than the transaction amount');
        }

        return Promise.resolve(true);

    }

    //Technical Debt:  This belongs in a helper like Process.js
    refundTransaction(args){

        du.debug('Refund Transaction');

        let transaction = args.transaction;
        let refund = args.refund;

        return this.get({id: transaction}).then((transaction) => {

            return this.validate(transaction).then(() => {

                return this.validateRefund(refund, transaction).then(() => {

                    return this.executeAssociatedEntityFunction('merchantProviderController', 'issueRefund', {transaction: transaction, refund: refund}).then((processor_result) => {

                        let refund_transaction = {
                            rebill: transaction.rebill,
                            amount: (refund.amount * -1),
                            products: transaction.products,
                            merchant_provider: transaction.merchant_provider
                        };

                        return this.putTransaction(refund_transaction, processor_result);

                    });

                });

            });

        });

    }

    updateTransaction(entity){

        if(!_.has(entity, 'alias')){

            let alias = this.createAlias();

            entity['alias'] = alias;

        }

        return this.update({entity: entity});

    }

    createTransaction(entity){

        if(!_.has(entity, 'alias')){

            let alias = this.createAlias();

            entity['alias'] = alias;

        }

        return this.create({entity: entity});

    }

    // Technical Debt: This method ignores cursor and limit, returns all. Implementing proper pagination is tricky since
    // we retrieve data in 3 steps (sessions first, then rebills for each session, then transaction for each session).
    //Technical Debt:  Please refactor.
    listByCustomer({customer, pagination, fatal}){

        du.debug('List Transactions By Customer');

        return this.executeAssociatedEntityFunction('customerController', 'getCustomerSessions', customer)
        .then(sessions => {

          if (!sessions) {
            return this.createEndOfPaginationResponse('transactions', []);
          }

          //Technical Debt:  Use a list method.
          let rebill_promises = arrayutilities.map(sessions, (session) => {
            return this.executeAssociatedEntityFunction('rebillController', 'listBySession', {session: session}).then(rebills => this.getResult(rebills, 'rebills'))
          });

          return Promise.all(rebill_promises).then((rebill_lists) => {

            let rebill_ids = [];

            rebill_lists = rebill_lists || [];

            arrayutilities.map(rebill_lists, (rebill_list) => {

              let list = rebill_list || [];

              arrayutilities.map(list, (rebill) => {
                  rebill_ids.push(rebill.id);
              });

            });

            let transaction_promises = arrayutilities.map(rebill_ids, (rebill) => {
              return this.executeAssociatedEntityFunction('transactionController', 'listBySecondaryIndex', {field: 'rebill', index_value: rebill, index_name: 'rebill-index', pagination: pagination});
            });

            return Promise.all(transaction_promises).then(transaction_responses => {

              let transactions = [];

              transaction_responses = transaction_responses || [];

              transaction_responses.forEach((transaction_response) => {

                let transactions_from_response = transaction_response.transactions || [];

                transactions_from_response.forEach((transaction) => {
                  if (transaction && _.has(transaction, 'id')) {
                    transactions.push(transaction);
                  } else {
                    du.warning('Invalid transaction', transaction);
                  }
                });

              });

              return this.createEndOfPaginationResponse('transactions', transactions);

            });

          });

      });

    }


}

module.exports = new transactionController();

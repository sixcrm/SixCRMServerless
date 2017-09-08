'use strict';
const _ = require('underscore');
var random = global.SixCRM.routes.include('lib', 'random.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
var shippingReceiptController = global.SixCRM.routes.include('controllers', 'entities/ShippingReceipt.js');
const merchantProviderController = global.SixCRM.routes.include('controllers','entities/MerchantProvider.js');

class transactionController extends entityController {

    constructor(){
        super('transaction');
    }

	//Technical Debt:  Why is this missing rebills
    getParentRebill(transaction){

        if(_.has(transaction, 'rebill')){
            var rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

            return rebillController.get(transaction.rebill);
        }else{
            return null;
        }

    }

    getProduct(id){

      if(!_.has(this, 'productController') || !_.isFunction(this.productController.get)){
        this.productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
      }

      return this.productController.get(id);

    }

    getTransactionProducts(transaction){

        return transaction.products.map((transactionproduct) => {

            var base_product = {
                "amount": transactionproduct.amount,
                "product": transactionproduct.product
            };

            if(_.has(transactionproduct, "shippingreceipt")){
                base_product['shippingreceipt'] = transactionproduct.shippingreceipt;
            }

            return base_product;

        });

    }

    getTransactionProduct(transaction_product){

        du.debug('Get Transaction Product');

        var promises = [];

        if(_.has(transaction_product, "product")){

          if(!_.has(this, 'productController') || !_.isFunction(this.productController.get)){
            this.productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
          }

          var getProduct = this.productController.get(transaction_product.product);

            promises.push(getProduct);
        }else{
            return null;
        }

        if(_.has(transaction_product, "shippingreceipt")){
            var getShippingReceipt = shippingReceiptController.get(transaction_product.shippingreceipt);

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

    getProducts(transaction){

        du.debug('Get Products');

        if(!_.has(transaction, "products")){ return null; }

        du.debug('Transaction Products', transaction.products);

        return Promise.all(transaction.products.map(transaction_product => this.getTransactionProduct(transaction_product)));

    }

    getTransactionsByRebillID(id){

        return this.queryBySecondaryIndex('rebill', id, 'rebill-index').then((result) => this.getResult(result));

    }

    putTransaction(params, processor_response){

        du.debug('Put Transaction');

        const rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

        return rebillController.get(params.rebill).then((rebill) => {

            params.rebill = rebill;

            var transaction = this.createTransactionObject(params, processor_response);

            return this.create(transaction);

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

    refundTransaction(args){

        du.debug('Refund Transaction');

        let transaction = args.transaction;
        let refund = args.refund;

        return this.get(transaction).then((transaction) => {

            return this.validate(transaction).then(() => {

                return this.validateRefund(refund, transaction).then(() => {

                    return merchantProviderController.issueRefund(transaction, refund).then((processor_result) => {

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

        du.highlight(entity);

        return this.update(entity);

    }

    createTransaction(entity){

        if(!_.has(entity, 'alias')){

            let alias = this.createAlias();

            entity['alias'] = alias;

        }

        du.highlight(entity);

        return this.create(entity);

    }

}

module.exports = new transactionController();

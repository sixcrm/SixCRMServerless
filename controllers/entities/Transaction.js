'use strict';
const _ = require('underscore');
var timestamp = global.routes.include('lib', 'timestamp.js');
var random = global.routes.include('lib', 'random.js');
const du = global.routes.include('lib', 'debug-utilities.js');

var productController = global.routes.include('controllers', 'entities/Product.js');
var entityController = global.routes.include('controllers', 'entities/Entity.js');
var shippingReceiptController = global.routes.include('controllers', 'entities/ShippingReceipt.js');
const merchantProviderController = global.routes.include('controllers','entities/MerchantProvider.js');

class transactionController extends entityController {

    constructor(){
        super('transaction');
    }

	//Technical Debt:  Why is this missing rebills
    getParentRebill(transaction){

        if(_.has(transaction, 'rebill')){
            var rebillController = global.routes.include('controllers', 'entities/Rebill.js');

            return rebillController.get(transaction.rebill);
        }else{
            return null;
        }

    }

    getProduct(id){

        return productController.get(id);

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
            var getProduct = productController.get(transaction_product.product);

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

        var transaction = this.createTransactionObject(params, processor_response);

        return this.create(transaction);

    }

    createTransactionObject(params, processor_response){

        du.debug('Creating Transaction Object');

        var return_object = {
            rebill: params.rebill.id,
            processor_response: JSON.stringify(processor_response),
            amount: params.amount,
            products: params.products,
            alias: this.createAlias(),
            merchant_provider: processor_response.merchant_provider
        }

        return return_object;

    }

    createAlias(){

        let alias = random.createRandomString(9);

        return 'T'+alias;

    }

    validateRefund(refund, transaction){

        let validated = [];

        //Technical Debt:  This should be, uh more rigorous...

        if(refund.amount > transaction.amount){
            throw new Error('Refund amount is greater than the transaction amount');
        }

        return Promise.resolve(validated);

    }

    refundTransaction(args){

        du.debug('Refund Transaction');

        let transaction = args.transaction;
        let refund = args.refund;

        return this.get(transaction).then((transaction) => {

            return this.validate(transaction).then((validated) => {

                return this.validateRefund(refund, transaction).then(() => {

                    return merchantProviderController.issueRefund(transaction, refund).then((processor_result) => {

                        du.warning(processor_result);
                        process.exit();

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

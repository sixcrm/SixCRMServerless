'use strict';
var _ = require("underscore");

var rebillController = require('../../controllers/Rebill.js');
var transactionController = require('../../controllers/Transaction.js');
var shippingStatusController = require('../../controllers/shippingproviders/ShippingStatus.js');
var workerController = require('./worker.js');

class confirmDeliveredController extends workerController {

    constructor(){
        super();
        this.messages = {
            delivered: 'DELIVERED'
        };
    }

    execute(event){

        return new Promise((resolve, reject) => {
            this.acquireRebill(event).then((rebill) => {
                this.confirmDelivered(rebill).then((delivered) => {
                    resolve(delivered);
                });
            }).catch(error => {
                reject(error);
            });

        });

    }

	//Technical Debt:  Review this logic
	//Technical Debt:  Confirm after the tracking number goes to "delivered"
	//Technical Debt:  This should only execute AFTER the shipping receipt is three days old
    confirmDelivered(rebill) {
        var promises = [];
        var getTransactions = rebillController.getTransactions(rebill);

        promises.push(getTransactions);

        var delivered = {
            message:this.messages.delivered
        };

        return Promise.all(promises).then((promises) => {
            var transactions = promises[0];

            var transaction_products = [];

            transactions.map((transaction) => {

                if(_.has(transaction, 'products')){

                    transaction.products.map((transaction_product) => {

                        var getTransactionProduct = transactionController.getTransactionProduct(transaction_product);

                        transaction_products.push(getTransactionProduct);

                    });

                }

            });

            return Promise.all(transaction_products).then((transaction_products) => {

                var shipping_provider_stati = [];

                transaction_products.map((transaction_product) => {

                    if(_.has(transaction_product, "shippingreceipt") && _.has(transaction_product.shippingreceipt, "trackingnumber")){

						//Technical Debt:  This is hard-coded to USPS, that may need to change
                        var getShippingProviderStatus = shippingStatusController.getStatus('usps', transaction_product.shippingreceipt.trackingnumber);

                        shipping_provider_stati.push(getShippingProviderStatus);

                    }

                });

                return Promise.all(shipping_provider_stati).then((shipping_provider_stati) => {

                    shipping_provider_stati.map((shipping_provider_status) => {

                        if(_.has(shipping_provider_status, "parsed_status")){

                            if(shipping_provider_status.parsed_status !== this.messages.delivered){

                                delivered.message = shipping_provider_status.parsed_status;

                                return;

                            }

                        }

                    });

                });

            }).then(() => {

				/*
				if(delivered.message == this.messages.delivered){
					delivered.forward = {id:rebill.id};
				}

				return delivered;
				*/

            });

        }).then(() => {

            if(delivered.message == this.messages.delivered){
                delivered.forward = {id:rebill.id};
            }

            return delivered;

        });

    }

}

module.exports = new confirmDeliveredController();
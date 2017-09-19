'use strict';
var _ = require("underscore");

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

var transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');
var rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
var workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');

class archiveController extends workerController {

    constructor(){
        super();
        this.messages = {
            success: 'ARCHIVED',
            skip:'SKIP'
        };
        this.archivefilters = {
            all:'ALL',
            noship:'NOSHIP',
            twoattempts:'TWOATTEMPTS'
        }

    }

    execute(event){

        return this.acquireRebill(event).then((rebill) => this.archive(rebill));

    }

    confirmSecondAttempt(rebill) {

        return Promise.resolve(_.has(rebill, 'second_attempt'));

    }

    confirmNoShip(rebill){

        var confirmed = true;

        return new Promise((resolve, reject) => {

            rebillController.listTransactions(rebill).then((transactions) => {

                var transaction_products = [];

                transactions.forEach((transaction) => {

                    transaction_products.push(transactionController.getProducts(transaction));

                });

                return Promise.all(transaction_products).then((transaction_products) => { // eslint-disable-line promise/always-return

                    transaction_products.forEach((transaction_product_collection) => {

                        transaction_product_collection.forEach((a_transaction_product) => {

                            if(this.isProductShip(a_transaction_product.product)){

                                confirmed = false;

                                return;

                            }

                        });

                    });

                }).then(() => {

                    return resolve(confirmed);

                });

            }).catch((error) => {
                return reject(error);
            });

        });

    }

    isProductShip(product) {
        return product.ship === 'true' || product.ship === true;
    }

    archive(rebill){

        return new Promise((resolve, reject) => {

            if(_.has(process.env, "archivefilter")){

                switch(process.env.archivefilter){

                case this.archivefilters.all:

                    return resolve(this.messages.success);

                case this.archivefilters.noship:

                    return this.confirmNoShip(rebill).then((confirmed) => {

                        if(confirmed === true){
                            return resolve(this.messages.success);
                        }else{
                            return resolve(this.messages.skip);
                        }

                    })

                case this.archivefilters.twoattempts:

                    return this.confirmSecondAttempt(rebill).then((confirmed) => {

                        if(confirmed === true){
                            return resolve(this.messages.success);
                        }else{
                            return resolve(this.messages.skip);
                        }

                    });

                default:

                    return reject(eu.getError('not_implemented','Unrecognized archive filter: '+process.env.archivefilter));

                }

            }else{

                return resolve(this.messages.success);

            }


        });

    }

    createForwardObject() {

        return Promise.resolve({forward: true});

    }

}

module.exports = new archiveController();

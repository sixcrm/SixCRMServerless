'use strict';
var _ = require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

var HashtagController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/Hashtag.js');
var fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider.js');

class fulfillmentTriggerController {

    constructor(){

    }

    triggerFulfillment(transaction_product){

        return this.getFulfillmentProvider(transaction_product).then((transaction_product) => this.executeFulfillment(transaction_product));

    }

    executeFulfillment(transaction_product){

        return new Promise((resolve, reject) => {

            if(!_.has(transaction_product.product, "fulfillment_provider") || !_.has(transaction_product.product.fulfillment_provider, "name")){

                reject(eu.getError('bad_request', 'Unable to identify fulfillment provider associated with the transaction_product.'));

            }

            switch(transaction_product.product.fulfillment_provider.provider){

            case 'HASHTAG':

                HashtagController.triggerFulfillment(transaction_product).then((fulfillment_response) => {

                    return resolve(fulfillment_response);

                }).catch((error) => {
                    return reject(error);
                });

                break;

            default:

                reject(eu.getError('not_implemented','Unknown fulfillment provider: ' + transaction_product.product.fulfillment_provider.provider));

                break;

            }

        });

    }

	//Technical Debt:  It'd be better if the object that was coming through the pipe was hydrated...
    getFulfillmentProvider(transaction_product){

        return fulfillmentProviderController.get({id: transaction_product.product.fulfillment_provider}).then((fulfillment_provider) => {

            transaction_product.product.fulfillment_provider = fulfillment_provider;

            return transaction_product;

        });

    }

}

module.exports = new fulfillmentTriggerController();

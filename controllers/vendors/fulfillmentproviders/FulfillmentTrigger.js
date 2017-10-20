'use strict';
var _ = require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const HashtagController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/Hashtag/Hashtag.js');
const fulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider.js');
const fulfillmentProviderEntityController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');

class fulfillmentTriggerController {

    constructor(){

    }

    triggerFulfillment(transaction_product){

        du.debug('Trigger Fulfillment');

        return this.getFulfillmentProvider(transaction_product).then((transaction_product) => this.executeFulfillment(transaction_product));

    }

    executeFulfillment(transaction_product){

        du.debug('Execute Fulfillment');

        return new Promise((resolve, reject) => {

            if(!_.has(transaction_product.product, "fulfillment_provider") || !_.has(transaction_product.product.fulfillment_provider, "name")){

                reject(eu.getError('bad_request', 'Unable to identify fulfillment provider associated with the transaction_product.'));

            }

            // Technical Debt: Extract this to generic logic and reuse it.
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

    validateProvider(id) {

        du.debug('Validate Provider', id);

        return fulfillmentProviderEntityController.get({id: id}).then((entity) => {

            du.debug(entity);

            // Technical Debt: Extract this to generic logic and reuse it.
            if (entity.provider === 'HASHTAG') {
                return HashtagController.testConnection(entity).then(response => {
                    return { response: response }
                });
            }
        });

    }

}

module.exports = new fulfillmentTriggerController();

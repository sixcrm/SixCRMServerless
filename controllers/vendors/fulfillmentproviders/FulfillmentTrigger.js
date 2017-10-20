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

            this.assertNameAndType(transaction_product.product.fulfillment_provider);

            let controller = this.getControllerInstance(transaction_product.product.fulfillment_provider.provider);

            return controller.triggerFulfillment(transaction_product).then((fulfillment_response) => {

                return resolve(fulfillment_response);

            }).catch((error) => {
                return reject(error);
            });

        });

    }

    assertNameAndType(provider) {
        if(!_.has(provider, "name") || !_.has(provider.provider)){

            eu.throwError('bad_request', 'Unable to identify fulfillment provider associated with the transaction_product.');

        }
    }

	//Technical Debt:  It'd be better if the object that was coming through the pipe was hydrated...
    getFulfillmentProvider(transaction_product){

        return fulfillmentProviderController.get({id: transaction_product.product.fulfillment_provider}).then((fulfillment_provider) => {

            transaction_product.product.fulfillment_provider = fulfillment_provider;

            return transaction_product;

        });

    }

    getControllerInstance(provider) {

        du.debug('Get Controller Instance', provider);

        let provider_type = provider.provider;

        switch(provider_type){

            case 'HASHTAG':

                return HashtagController;

            default:

                eu.throwError('not_implemented','Unknown fulfillment provider: ' + provider_type);

                break;

        }
    }

    validateProvider(id) {

        du.debug('Validate Provider', id);

        return fulfillmentProviderEntityController.get({id: id}).then((entity) => {

            let controller = this.getControllerInstance(entity);

            return controller.testConnection(entity).then(response => {
                return { response: response }
            });
        });

    }

}

module.exports = new fulfillmentTriggerController();

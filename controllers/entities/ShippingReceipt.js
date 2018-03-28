'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class ShippingReceiptController extends entityController {

    constructor(){
        super('shippingreceipt');

        this.search_fields = ['status'];
    }

    //Technical Debt:  What is this?  This belongs in a helper me thinks...
    createShippingReceiptObject(params){

        var return_object = {
            created: timestamp.createTimestampSeconds(),
            status: params.status
        }

        return return_object;

    }

    getFulfillmentProvider(shipping_receipt){

      du.debug('Get Fulfillment Provider');

      if(_.has(shipping_receipt, "fulfillment_provider")){

        return this.executeAssociatedEntityFunction('FulfillmentProviderController', 'get', {id: shipping_receipt.fulfillment_provider});

      }else{

        return Promise.resolve(null);

      }

    }

}

module.exports = new ShippingReceiptController();

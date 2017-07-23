'use strict';
var timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class ShippingReceiptController extends entityController {

    constructor(){
        super('shippingreceipt');
    }

    createShippingReceiptObject(params){

        var return_object = {
            created:timestamp.createTimestampSeconds(),
            status:params.status
        }

        return return_object;

    }

}

module.exports = new ShippingReceiptController();

'use strict';
var timestamp = require('../lib/timestamp.js');

var entityController = require('./Entity.js');

class ShippingReceiptController extends entityController {

    constructor(){
        super(process.env.shipping_receipts_table, 'shippingreceipt');
        this.table_name = process.env.shipping_receipts_table;
        this.descriptive_name = 'shippingreceipt';
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
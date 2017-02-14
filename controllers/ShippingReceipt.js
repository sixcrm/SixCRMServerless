'use strict';
var entityController = require('./Entity.js');

class ShippingReceiptController extends entityController {

	constructor(){
		super(process.env.shipping_receipts_table, 'shippingreceipt');
		this.table_name = process.env.shipping_receipts_table;
		this.descriptive_name = 'shippingreceipt';
	}
	
}

module.exports = new ShippingReceiptController();
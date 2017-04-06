'use strict';
const _ = require('underscore');
var entityController = require('./Entity.js');
var userController = require('./User.js');
var customerController = require('./Customer.js');

class customerNoteController extends entityController {

	constructor(){
		super(process.env.customer_notes_table, 'customernote');
		this.table_name = process.env.customer_notes_table;
		this.descriptive_name = 'customernote';
	}
	
	getCustomer(customer_note){
		
		return customerController.get(customer_note.customer);
		
	}
	
	getUser(customer_note){
		
		return userController.get(customer_note.user);
		
	}
		
}

module.exports = new customerNoteController();

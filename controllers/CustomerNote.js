'use strict';
const _ = require('underscore');
var entityController = require('./Entity.js');

class customerNoteController extends entityController {

	constructor(){
		super(process.env.customer_notes_table, 'customernote');
		this.table_name = process.env.customer_notes_table;
		this.descriptive_name = 'customernote';
	}
	
}

module.exports = new customerNoteController();

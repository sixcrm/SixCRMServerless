'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');

var entityController = global.routes.include('controllers', 'entities/Entity.js');
var userController = global.routes.include('controllers', 'entities/User.js');
var customerController = global.routes.include('controllers', 'entities/Customer.js');

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

    listByCustomer(customer, pagination){

        return this.queryBySecondaryIndex('customer', customer, 'customer-index', pagination)
          .then((result) => this.getResult(result))
          //Technical Debt:  Redundancy?
          .then((result) => {
              return { customernotes: result }
          });
    }

}

module.exports = new customerNoteController();

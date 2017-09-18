'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class customerNoteController extends entityController {

    constructor(){
        super('customernote');
    }

    getCustomer(customer_note){

      du.debug('Get Customer');

      return this.executeAssociatedEntityFunction('customerController', 'get', {id: customer_note.customer});

    }

    getUser(customer_note){

      du.debug('Get User');

      return this.executeAssociatedEntityFunction('userController', 'get', {id: customer_note.user});

    }

    listByCustomer({customer, pagination}){

      du.debug('List By Customer');

      return this.queryBySecondaryIndex({field: 'customer', index_value: this.getID(customer), index_name:'customer-index', pagination: pagination, reverse_order: true});

    }

}

module.exports = new customerNoteController();

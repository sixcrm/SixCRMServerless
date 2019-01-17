var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class CustomerNoteController extends entityController {

	constructor(){
		super('customernote');
	}

	getCustomer(customer_note){
		return this.executeAssociatedEntityFunction('CustomerController', 'get', {id: customer_note.customer});

	}

	getUser(customer_note){
		return this.executeAssociatedEntityFunction('userController', 'get', {id: customer_note.user});

	}

	listByCustomer({customer, pagination}){
		return this.queryBySecondaryIndex({field: 'customer', index_value: this.getID(customer), index_name:'customer-index', pagination: pagination, reverse_order: true});

	}

}


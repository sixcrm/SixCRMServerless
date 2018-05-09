

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
const ConfirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');
const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

module.exports = class CheckoutController extends transactionEndpointController{

	constructor(){

		super();

		this.required_permissions = [
			'user/read',
			'account/read',
			'session/create',
			'session/read',
			'session/update',
			'campaign/read',
			'creditcard/create',
			'creditcard/update',
			'creditcard/read',
			'productschedule/read',
			'merchantprovidergroup/read',
			'merchantprovidergroupassociation/read',
			'rebill/read',
			'rebill/create',
			'rebill/update',
			'product/read',
			'affiliate/read',
			'notification/create',
			'tracker/read'
		];

		this.parameter_definitions = {
			execute: {
				required : {
					event:'event'
				}
			}
		};

		this.parameter_validation = {
			'event':global.SixCRM.routes.path('model', 'endpoints/checkout/event.json'),
			'session':global.SixCRM.routes.path('model', 'entities/session.json'),
			'order':global.SixCRM.routes.path('model', 'endpoints/checkout/order.json'),
			'confirmation':global.SixCRM.routes.path('model', 'endpoints/confirmOrder/response.json')
		};

		this.createLeadController = new CreateLeadController();
		this.createOrderController = new CreateOrderController();
		this.confirmOrderController = new ConfirmOrderController();

		this.event_type = 'checkout';

		this.initialize();

	}

	execute(event){

		du.debug('Execute');

		return this.preamble(event)
			.then(() => this.createLead())
			.then(() => this.setSession())
			.then(() => this.createOrder())
			.then(() => this.confirmOrder())
			.then(() => {

				let info = this.parameters.get('confirmation');

				return info;

			});

	}

	setSession(){

		du.debug('Set Session');

		let session = this.parameters.get('session');

		let event = this.parameters.get('event');

		event.session = session.id;

		this.parameters.set('event', event);

		return Promise.resolve(true);

	}

	confirmOrder(){

		du.debug('Confirm Order');

		let event = this.parameters.get('event');

		this.confirmOrderController.parameters.set('event', event);

		return this.confirmOrderController.confirmOrder().then(result => {
			this.parameters.set('confirmation', result);
			return Promise.resolve(true);
		});

	}

	createOrder(){

		du.debug('Create Order');

		let event = this.parameters.get('event');

		this.createOrderController.parameters.set('event', event);

		return this.createOrderController.createOrder().then(result => {
			this.parameters.set('order', result);
			return Promise.resolve(true);
		});

	}

	createLead(){

		du.debug('Create Lead');

		let event = this.parameters.get('event');

		this.createLeadController.parameters.set('event', event);

		return this.createLeadController.createLead().then(result => {
			this.parameters.set('session', result);
			return Promise.resolve(true);
		});

	}

}

const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;

const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');

const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
const ProductHelperController = global.SixCRM.routes.include('helpers', 'entities/product/Product.js');
const CustomerHelperController = global.SixCRM.routes.include('helpers', 'entities/customer/Customer.js');

module.exports = class OrderHelperController {

	constructor() {

	}

	async createOrder({
		rebill,
		session = null,
		transactions = null,
		customer = null
	}) {

		du.debug('Create Order');

		let amount = rebill.amount;

		const transactionHelperController = new TransactionHelperController();
		const productHelperController = new ProductHelperController();
		const customerHelperController = new CustomerHelperController();

		if(_.isNull(transactions)){
			const rebillController = new RebillController();
			const result = await rebillController.listTransactions(rebill);
			transactions = await rebillController.getResult(result, 'transactions');
			if (_.isNull(transactions)) {
				transactions = [];
			}
		}

		if(_.isNull(session)){
			const rebillController = new RebillController();
			session = await rebillController.getParentSession(rebill);
		}

		if(_.isNull(customer)){
			const sessionController = new SessionController();
			customer = await sessionController.getCustomer(session);
		}

		let public_customer = customerHelperController.getPublicFields(customer);
		let products = transactionHelperController.getTransactionProducts(transactions);
		let public_products = arrayutilities.map(products, product_group => {
			return {
				product: productHelperController.getPublicFields(product_group.product),
				quantity: product_group.quantity,
				amount: product_group.amount
			}
		});

		return {
			id: rebill.alias,
			customer: public_customer,
			products: public_products,
			amount: amount,
			date: rebill.created_at,
			session: session.id
		};

	}

	async getOrder({id}) {
		const rebillController = new RebillController();
		const rebill = await rebillController.getByAlias({alias: id});
		return this.createOrder({rebill});
	}

	async listBySession({session_id, pagination}) {
		const sessionController = new SessionController();
		const rebillController = new RebillController();
		const session = await sessionController.get({id: session_id});
		const customer = await sessionController.getCustomer(session);
		const rebill_result = await rebillController.listBySession({session, pagination});
		const orders = await Promise.all(arrayutilities.map(rebill_result.rebills, rebill => this.createOrder({ rebill, session, customer })));
		return {
			orders,
			pagination: rebill_result.pagination
		};
	}

	async listByCustomer({customer_id, pagination}) {
		const customerController = new CustomerController();
		const rebillController = new RebillController();
		const sessionController = new SessionController();
		const customer = await customerController.get({id: customer_id});
		const {sessions} = await sessionController.listByCustomer({customer});

		let rebill_query_parameters = rebillController.createINQueryParameters({
			field: 'parentsession',
			list_array: arrayutilities.map(sessions, session => session.id)
		});

		const rebill_result = await rebillController.listByAccount({
			query_parameters: rebill_query_parameters,
			pagination
		});

		const indexed_sessions = arrayutilities.reduce(sessions, (index, session) => {
			index[session.id] = session;
			return index;
		}, {});

		const rebill_pairs = arrayutilities.map(rebill_result.rebills, rebill => ({
			rebill,
			session: indexed_sessions[rebill.parentsession]
		}));

		const orders = await Promise.all(arrayutilities.map(rebill_pairs, ({rebill, session}) => this.createOrder({ rebill, session, customer })));
		return {
			orders,
			pagination: rebill_result.pagination
		};
	}
}

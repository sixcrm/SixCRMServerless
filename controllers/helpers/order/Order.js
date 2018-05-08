const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

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
			transactions = await rebillController.listTransactions(rebill);
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

}

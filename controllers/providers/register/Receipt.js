
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const TransactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

module.exports = class RegisterRecieptGenerator {

	constructor(){

		this.transactionController = new TransactionController();

		this.parameter_definitions = {
			issueReceipt:{
				required:{
					rebill:'rebill',
					amount:'amount',
					transactiontype:'transactiontype',
					processorresponse:'processorresponse',
					merchantprovider:'merchant_provider',
					transactionproducts:'transaction_products'
				},
				optional:{
					associatedtransaction: 'associatedtransaction'
				}
			}
		};

		this.parameter_validation = {
			'rebill':global.SixCRM.routes.path('model','entities/rebill.json'),
			'amount':global.SixCRM.routes.path('model','definitions/currency.json'),
			'merchantprovider':global.SixCRM.routes.path('model','definitions/uuidv4.json'),
			'transactiontype':global.SixCRM.routes.path('model','functional/register/transactiontype.json'),
			'processorresponse':global.SixCRM.routes.path('model','functional/register/processorresponse.json'),
			'associatedtransaction':global.SixCRM.routes.path('model','entities/transaction.json'),
			'transactionproducts':global.SixCRM.routes.path('model','functional/register/transactionproducts.json'),
			'receipt_transaction': global.SixCRM.routes.path('model', 'entities/transaction.json'),
			'transactionprototype':global.SixCRM.routes.path('model', 'functional/register/transactionprototype.json'),
			'transformed_transaction_prototype':global.SixCRM.routes.path('model', 'functional/register/transformedtransactionprototype.json')
		};

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definitions});

	}

	issueReceipt(){

		du.debug('Issue Receipt');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'issueReceipt'}))
			.then(() => this.createTransactionPrototype())
			.then(() => this.transformTransactionPrototypeObject())
			.then(() => this.createTransaction())
			.then(() => {
				return this.parameters.get('receipt_transaction');
			});

	}

	createTransactionPrototype(){

		du.debug('Create Transaction Prototype');

		let rebill = this.parameters.get('rebill');
		let amount = this.parameters.get('amount');
		let transaction_type = this.parameters.get('transactiontype');
		let processor_response = this.parameters.get('processorresponse');
		let processor_response_code = this.parameters.get('processorresponse').code;

		let transaction_prototype = {
			rebill: rebill,
			amount: amount,
			type: transaction_type,
			result: processor_response_code,
			processor_response: processor_response
		};

		if(_.includes(['reverse','refund'], transaction_type)){
			let associated_transaction = this.parameters.get('associatedtransaction');

			transaction_prototype = objectutilities.merge(transaction_prototype, {
				products: associated_transaction.products,
				merchant_provider: associated_transaction.merchant_provider,
				associated_transaction: associated_transaction.id
			});
		}

		if(_.includes(['sale'], transaction_type)){

			let merchant_provider = this.parameters.get('merchantprovider');
			let transaction_products = this.parameters.get('transactionproducts');

			transaction_prototype = objectutilities.merge(transaction_prototype, {
				merchant_provider: merchant_provider,
				products: transaction_products
			});

		}

		this.parameters.set('transactionprototype', transaction_prototype);

		return Promise.resolve(true);

	}

	transformTransactionPrototypeObject(){

		du.debug('Transform Transaction Prototype Object');

		let transaction_prototype = this.parameters.get('transactionprototype');

		var transformed_transaction_prototype = {
			account: transaction_prototype.rebill.account,
			rebill: transaction_prototype.rebill.id,
			processor_response: JSON.stringify(transaction_prototype.processor_response),
			amount: transaction_prototype.amount,
			products: transaction_prototype.products,
			alias: this.transactionController.createAlias(),
			merchant_provider: transaction_prototype.merchant_provider,
			type: transaction_prototype.type,
			result: transaction_prototype.result
		};

		if(_.has(transaction_prototype, 'associated_transaction')){
			transformed_transaction_prototype.associated_transaction  = transaction_prototype.associated_transaction;
		}

		this.parameters.set('transformed_transaction_prototype', transformed_transaction_prototype);

	}

	createTransaction(){

		du.debug('Create Transaction');

		let transformed_transaction_prototype = this.parameters.get('transformed_transaction_prototype');

		return this.transactionController.create({entity: transformed_transaction_prototype}).then(transaction => {
			return this.parameters.set('receipt_transaction', transaction);
		});

	}

}

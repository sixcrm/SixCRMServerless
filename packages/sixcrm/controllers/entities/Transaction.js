
const _ = require('lodash');
var random = require('@6crm/sixcrmcore/lib/util/random').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const { getProductSetupService, LegacyProduct } = require('@6crm/sixcrm-product-setup');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class TransactionController extends entityController {

	constructor(){
		super('transaction');

		this.search_fields = ['alias'];

		this.sanitize(false);
	}

	//Technical Debt:  Finish
	associatedEntitiesCheck(){
		return Promise.resolve([]);
	}

	getReturn(entity){
		return this.executeAssociatedEntityFunction('ReturnController', 'get', {id: this.getID(entity)});

	}

	listByMerchantProviderID({id, pagination}){
		return this.queryBySecondaryIndex({index_name: 'merchant_provider-index', field: 'merchant_provider', index_value: id, pagination});

	}

	getMerchantProvider(transaction){
		return this.executeAssociatedEntityFunction('MerchantProviderController', 'get', {id: this.getID(transaction.merchant_provider)});

	}

	//Technical Debt:  This is pretty complicated.
	listByProductID(){
		//this should return a array of transactions that reference a given product_id
		return null;

	}

	//Technical Debt:  Why is this missing rebills
	getParentRebill(transaction){
		if(_.has(transaction, 'rebill')){

			return this.executeAssociatedEntityFunction('RebillController', 'get', {id: this.getID(transaction.rebill)});

		}

		return null;

	}

	async getProduct(product){
		const product_result = await getProductSetupService().getProduct(this.getID(product));
		return LegacyProduct.hybridFromProduct(product_result);
	}

	listByState({state, state_changed_after, pagination}){
		let query_parameters = {};

		if (state) {
			query_parameters = this.appendFilterExpression(query_parameters, '#state = :statev');
			query_parameters = this.appendExpressionAttributeNames(query_parameters, '#state', 'state');
			query_parameters = this.appendExpressionAttributeValues(query_parameters, ':statev', state);
		}

		if (state_changed_after) {
			query_parameters = this.appendFilterExpression(query_parameters, '#statechangedat > :statechangedatv');
			query_parameters = this.appendExpressionAttributeNames(query_parameters, '#statechangedat', 'state_changed_at');
			query_parameters = this.appendExpressionAttributeValues(query_parameters, ':statechangedatv', state_changed_after);
		}

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

	}

	//Technical Debt:  Refactor name
	//Technical Debt:  This is in the helper...
	getTransactionProducts(transaction){
		let return_array = [];

		arrayutilities.map(transaction.products, (transactionproduct) => {

			if(_.has(transactionproduct, 'amount') && _.has(transactionproduct, 'product')){

				let base_product = {
					"amount": transactionproduct.amount,
					"product": transactionproduct.product
				};

				if(_.has(transactionproduct, "shipping_receipt")){
					base_product['shippingreceipt'] = transactionproduct.shipping_receipt;
				}

				return_array.push(base_product);

			}

		});

		if(arrayutilities.nonEmpty(return_array)){
			return return_array;
		}

		return null;

	}

	//Technical Debt: Refactor.
	getTransactionProduct(transaction_product){
		var promises = [];

		if(_.has(transaction_product, "product")){

			const promise = getProductSetupService()
				.getProduct(this.getID(transaction_product.product))
				.then(product => LegacyProduct.hybridFromProduct(product));
			promises.push(promise);

		}else{

			return null;

		}

		if(_.has(transaction_product, "shippingreceipt")){

			var getShippingReceipt = this.executeAssociatedEntityFunction('shippingReceiptController', 'get', {id: transaction_product.shippingreceipt});

			promises.push(getShippingReceipt);
		}

		return Promise.all(promises).then((promises) => {

			transaction_product['product'] = promises[0];

			if(_.has(transaction_product, 'shippingreceipt')){
				transaction_product['shippingreceipt'] = promises[1];
			}

			return transaction_product;

		});

	}

	//Technical Debt:  Refactor
	getProducts(transaction){
		du.info(transaction);
		if(!_.has(transaction, "products")){ return null; }

		return Promise.all(transaction.products.map(transaction_product =>
			this.getTransactionProduct(transaction_product)
				.then(transaction_product => {
					if(transaction_product.is_cycle_product) {
						transaction_product.product.ship = !!transaction_product.is_shipping;
					}

					return transaction_product;
				})
		));

	}

	listByAssociatedTransaction({id, rebill, types, results}){
		id = this.getID(id);
		rebill = this.getID(rebill);

		let query_parameters = {
			filter_expression: '#associatedtransaction = :associated_transaction_id',
			expression_attribute_values: {
				':associated_transaction_id': id
			},
			expression_attribute_names: {
				'#associatedtransaction': 'associated_transaction'
			}
		};

		if(!_.isUndefined(results) && arrayutilities.nonEmpty(results)){

			let additional_conditions = [];

			arrayutilities.map(results, (result) => {
				additional_conditions.push('#result = :result'+result);
				query_parameters.expression_attribute_values[':result'+result] = result;
				query_parameters.expression_attribute_names['#result'] = 'result';
			});

			query_parameters.filter_expression += ' AND ('+arrayutilities.compress(additional_conditions, ' OR ', '') + ')';

		}

		if(!_.isUndefined(types) && arrayutilities.nonEmpty(types)){

			let additional_conditions = [];

			arrayutilities.map(types, (type) => {
				additional_conditions.push('#typefield = :type'+type);
				query_parameters.expression_attribute_values[':type'+type] = type;
				query_parameters.expression_attribute_names['#typefield'] = 'type';
			});

			query_parameters.filter_expression += ' AND ('+arrayutilities.compress(additional_conditions, ' OR ', '') + ')';

		}

		return this.queryBySecondaryIndex({query_parameters, index_name: 'rebill-index', field: 'rebill', index_value: rebill});

	}

	listTransactionsByRebillID({id}){
		//Technical Debt: this is silly but necessary ATM
		id = this.getID(id);

		return this.queryBySecondaryIndex({field: 'rebill', index_value: id, index_name: 'rebill-index'});

	}

	putTransaction(params, processor_response){
		return this.executeAssociatedEntityFunction('RebillController', 'get', {id: params.rebill}).then((rebill) => {

			params.rebill = rebill;

			var transaction = this.createTransactionObject(params, processor_response);

			return this.create({entity: transaction});

		});

	}

	//Technical Debt:  This seems deprecated.
	getMerchantProviderID(parameters, processor_response){
		if(_.has(parameters, 'merchant_provider') && this.isUUID(parameters.merchant_provider)){
			return parameters.merchant_provider;
		}

		if(_.has(processor_response, 'merchant_provider') && this.isUUID(processor_response.merchant_provider)){
			return processor_response.merchant_provider;
		}

		return null;

	}

	createAlias(){

		let alias = random.createRandomString(9);

		return 'T'+alias;

	}

	validateRefund(refund, transaction){

		//Technical Debt:  This should be, uh more rigorous...
		//make sure that the transaction was successful

		if(refund.amount > transaction.amount){
			throw eu.getError('validation', 'Refund amount is greater than the transaction amount');
		}

		return Promise.resolve(true);

	}

	//Technical Debt:  This belongs in a helper like Process.js
	refundTransaction(args){
		let transaction = args.transaction;
		let refund = args.refund;

		return this.get({id: transaction}).then((transaction) => {

			return this.validate(transaction).then(() => {

				return this.validateRefund(refund, transaction).then(() => {

					return this.executeAssociatedEntityFunction('MerchantProviderController', 'issueRefund', {transaction: transaction, refund: refund}).then((processor_result) => {

						let refund_transaction = {
							rebill: transaction.rebill,
							amount: (refund.amount * -1),
							products: transaction.products,
							merchant_provider: transaction.merchant_provider
						};

						return this.putTransaction(refund_transaction, processor_result);

					});

				});

			});

		});

	}

	updateTransaction(entity){

		if(!_.has(entity, 'alias')){

			let alias = this.createAlias();

			entity['alias'] = alias;

		}

		return this.update({entity: entity});

	}

	createTransaction(entity){

		if(!_.has(entity, 'alias')){

			let alias = this.createAlias();

			entity['alias'] = alias;

		}

		return this.create({entity: entity});

	}

	// Technical Debt: This method ignores cursor and limit, returns all. Implementing proper pagination is tricky since
	// we retrieve data in 3 steps (sessions first, then rebills for each session, then transaction for each session).
	//Technical Debt:  Please refactor.
	listByCustomer({customer, pagination}){
		return this.executeAssociatedEntityFunction('CustomerController', 'getCustomerSessions', customer)
			.then(sessions => {

				if (!sessions) {
					return this.createEndOfPaginationResponse('transactions', []);
				}

				//Technical Debt:  Use a list method.
				let rebill_promises = arrayutilities.map(sessions, (session) => {
					return this.executeAssociatedEntityFunction('RebillController', 'listBySession', {session: session}).then(rebills => this.getResult(rebills, 'rebills'))
				});

				return Promise.all(rebill_promises).then((rebill_lists) => {

					let rebill_ids = [];

					rebill_lists = rebill_lists || [];

					arrayutilities.map(rebill_lists, (rebill_list) => {

						let list = rebill_list || [];

						arrayutilities.map(list, (rebill) => {
							rebill_ids.push(rebill.id);
						});

					});

					let transaction_promises = arrayutilities.map(rebill_ids, (rebill) => {
						return this.executeAssociatedEntityFunction('transactionController', 'queryBySecondaryIndex', {field: 'rebill', index_value: rebill, index_name: 'rebill-index', pagination: pagination});
					});

					return Promise.all(transaction_promises).then(transaction_responses => {

						let transactions = [];

						transaction_responses = transaction_responses || [];

						transaction_responses.forEach((transaction_response) => {

							let transactions_from_response = transaction_response.transactions || [];

							transactions_from_response.forEach((transaction) => {
								if (transaction && _.has(transaction, 'id')) {
									transactions.push(transaction);
								} else {
									du.warning('Invalid transaction', transaction);
								}
							});

						});

						return this.createEndOfPaginationResponse('transactions', transactions);

					});

				});

			});

	}


}

module.exports = TransactionController;

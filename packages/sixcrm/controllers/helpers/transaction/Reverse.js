const _ = require('lodash');
const TransactionUtilities = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');
const TransactionController = global.SixCRM.routes.include('entities','Transaction.js');

//Technical Debt:  Look at disabling and enabling ACLs here...
module.exports = class Reverse extends TransactionUtilities{

	constructor(){

		super();

		this.parameter_definitions = {
			required:{
				transaction: 'transaction'
			},
			optional:{}
		};

		this.parameter_validation = {
			'reverse': global.SixCRM.routes.path('model','transaction/reverse.json'),
			'transaction': global.SixCRM.routes.path('model','transaction/transaction.json'),
			'merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
			'selected_merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
			//'amount':global.SixCRM.routes.path('model','transaction/amount.json')
		};

		this.transactionController = new TransactionController();

		this.instantiateParameters();

	}

	reverse(parameters){
		return this.setParameters(parameters)
			.then(() => this.hydrateParameters())
			.then(() => this.reverseTransaction());

	}

	//Technical Debt: Untested...
	reverseTransaction(){
		return this.instantiateGateway()
			.then(() => this.createProcessingParameters())
			.then(() => {

				let instantiated_gateway = this.parameters.get('instantiated_gateway');
				let processing_parameters = this.parameters.get('reverse');

				return instantiated_gateway.reverse(processing_parameters);

			});

	}

	createProcessingParameters(){
		let transaction = this.parameters.get('transaction');

		if(_.has(transaction, 'processor_response')){
			try{
				transaction.processor_response = JSON.parse(transaction.processor_response);
			}catch(error){
				//no biggie
			}

		}

		let parameters = {
			transaction: transaction
		};

		this.parameters.set('reverse', parameters);

		return Promise.resolve(parameters);

	}

	hydrateParameters(){
		let transaction = this.parameters.get('transaction');

		return this.transactionController.get({id: transaction})
			.then((transaction) => {

				this.parameters.set('transaction', transaction);

				return this.transactionController.getMerchantProvider(transaction);

			})
			.then((merchantprovider) => {

				this.parameters.set('selected_merchantprovider', merchantprovider);

				return true;

			});

	}

}

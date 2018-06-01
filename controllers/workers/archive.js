
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
var workerController = global.SixCRM.routes.include('controllers', 'workers/sqs/worker.js');
const TransactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

module.exports = class archiveController extends workerController {

	constructor(){

		super();

		this.parameter_validation = {
			'archivefilter':global.SixCRM.routes.path('model', 'workers/archivefilter.json'),
			'transactions':global.SixCRM.routes.path('model', 'entities/components/transactions.json'),
			'products':global.SixCRM.routes.path('model', 'entities/components/products.json')
		};

		this.parameter_definition = {
			execute: {
				required: {
					message: 'message'
				},
				optional:{}
			}
		};

		this.archive_configuration = {
			all: () => {
				this.parameters.set('responsecode', 'success');
				return Promise.resolve(true);
			},
			noship: () => this.confirmNoShip(),
			twoattempts: () => this.confirmSecondAttempt()
		};

		this.transactionController = new TransactionController();
		this.rebillController = new RebillController();

		this.augmentParameters();

	}

	execute(message){

		du.debug('Execute');

		return this.preamble(message)
			.then(() => this.setArchiveFilter())
			.then(() => this.archive())
			.then(() => this.respond())
			.catch(error => {
				du.error(error);
				return super.respond('error', error.message);
			})

	}

	setArchiveFilter(){

		du.debug('Set Archive Filter');

		if(_.has(process.env, "archivefilter")){
			this.parameters.set('archivefilter', process.env.archivefilter);
		}

		return true;

	}

	confirmSecondAttempt() {

		du.debug('Confirm Second Attempt');

		let rebill = this.parameters.get('rebill');

		let response_code = 'noaction';

		if(_.has(rebill, 'second_attempt')){
			response_code = 'success';
		}

		this.parameters.set('responsecode', response_code);

		return Promise.resolve(true);

	}

	getRebillTransactions(){

		du.debug('Get Rebill Transactions');

		let rebill = this.parameters.get('rebill');

		return this.rebillController.listTransactions(rebill).then((transactions) => {

			this.parameters.set('transactions', transactions.transactions);

			return true;

		});

	}

	getTransactionProducts(){

		du.debug('Get Transaction Products');

		let transactions = this.parameters.get('transactions');

		let product_promises = arrayutilities.map(transactions, transaction => {
			return this.transactionController.getProducts(transaction);
		});

		return Promise.all(product_promises).then(product_promises => {

			let products = [];

			arrayutilities.map(product_promises, product_promise => {
				arrayutilities.map(product_promise, product => {
					products.push(product.product);
				});
			});

			//Technical Debt: I don't trust this...
			products = arrayutilities.unique(products);

			this.parameters.set('products', products);

			return true;

		});

	}

	areProductsNoShip(){

		du.debug('Are Products No Ship');

		let products = this.parameters.get('products');

		return arrayutilities.every(products, (product) => {
			return (product.ship == false);
		});

	}

	confirmNoShip(){

		du.debug('Confirm No Ship');

		return this.getRebillTransactions()
			.then(() => this.getTransactionProducts())
			.then(() => this.areProductsNoShip())
			.then((result) => {

				let response_code = 'noaction';

				if(result == true){
					response_code = 'success';
				}

				this.parameters.set('responsecode', response_code);

				return true;

			});

	}

	archive(){

		du.debug('Archive');

		let archive_filter = this.parameters.get('archivefilter', {fatal: false});

		if(_.isNull(archive_filter)){

			this.parameters.set('responsecode', 'success');
			return true;

		}

		return this.archive_configuration[archive_filter]();

	}

	respond(){

		du.debug('Respond');

		let response_code = this.parameters.get('responsecode');

		return super.respond(response_code);

	}

}

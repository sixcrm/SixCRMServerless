const _ = require('lodash');
const moment = require('moment');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const TransactionUtilities = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');
const TransactionController = global.SixCRM.routes.include('entities','Transaction.js');
const RebillController = global.SixCRM.routes.include('entities','Rebill.js');
const SessionController = global.SixCRM.routes.include('entities','Session.js');
const CustomerController = global.SixCRM.routes.include('entities','Customer.js');
const CampaignController = global.SixCRM.routes.include('entities','Campaign.js');
const CreditCardController = global.SixCRM.routes.include('entities','CreditCard.js');

//Technical Debt:  Look at disabling and enabling ACLs here...
module.exports = class Refund extends TransactionUtilities {

	constructor(){

		super();

		this.parameter_definitions = {
			required:{
				transaction: 'transaction'
			},
			optional:{
				amount: 'amount'
			}
		};

		this.parameter_validation = {
			'refund': global.SixCRM.routes.path('model','transaction/refund.json'),
			'transaction': global.SixCRM.routes.path('model','transaction/transaction.json'),
			'merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
			'selected_merchantprovider': global.SixCRM.routes.path('model','transaction/merchantprovider.json'),
			'amount':global.SixCRM.routes.path('model','transaction/amount.json')
		};

		this.transactionController = new TransactionController();
		this.rebillController = new RebillController();
		this.sessionController = new SessionController();
		this.customerController = new CustomerController();
		this.campaignController = new CampaignController();
		this.creditCardController = new CreditCardController();

		this.instantiateParameters();

	}

	refund(parameters){

		du.debug('Refund');

		return this.setParameters(parameters)
			.then(() => this.hydrateParameters())
			.then(() => this.refundTransaction());

	}

	//Technical Debt: Untested...
	refundTransaction(){

		du.debug('Process Transaction');

		return this.instantiateGateway()
			.then(() => this.createProcessingParameters())
			.then(() => {

				let instantiated_gateway = this.parameters.get('instantiated_gateway');
				let processing_parameters = this.parameters.get('refund');

				return instantiated_gateway.refund(processing_parameters);

			})
			.then((refund_response) => {
				du.debug('Refund.refundTransaction()', refund_response);

				this.pushEvent({event_type: 'refund', context:{
					refund: this.parameters.get('refund'),
					transaction: this.parameters.get('transaction'),
					rebill: this.parameters.get('rebill'),
					session: this.parameters.get('session'),
					customer: this.parameters.get('customer'),
					campaign: this.parameters.get('campaign'),
					creditcard: this.parameters.get('creditcard'),
					refund_response: refund_response
				}});

				return refund_response;
			});

	}

	async createProcessingParameters(){

		du.debug('Create Processing Parameters');

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

		let amount = this.parameters.get('amount', {fatal: false});

		if(!_.isNull(amount)){
			parameters.amount = amount;
		}

		let refund = parameters;
		refund.created_at = moment();
		let rebill = await this.rebillController.get({id: refund.transaction.rebill});
		let session = await this.sessionController.get({id: rebill.parentsession});
		let customer = await this.customerController.get({id: session.customer});
		let campaign = await this.campaignController.get({id: session.campaign});
		let creditcard = await this.creditCardController.get({id: refund.transaction.creditcard});

		this.parameters.set('refund', parameters);
		this.parameters.set('rebill', rebill);
		this.parameters.set('session', session);
		this.parameters.set('customer', customer);
		this.parameters.set('campaign', campaign);
		this.parameters.set('creditcard', creditcard);

		return Promise.resolve(refund);

	}

	//Technical Debt: Add Amount
	hydrateParameters(){

		du.debug('Hydrate Parameters');

		let transaction = this.parameters.get('transaction');

		return this.transactionController.get({id: transaction})
			.then((transaction) => {

				return this.transactionController.getMerchantProvider(transaction);

			})
			.then((merchantprovider) => {

				this.parameters.set('selected_merchantprovider', merchantprovider);

				return true;

			});

	}

};

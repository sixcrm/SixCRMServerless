

const Response = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class RegisterResponse extends Response {

	constructor(){

		super();

		this.parameter_validation = {
			'transactions': global.SixCRM.routes.path('model', 'entities/components/transactions.json'),
			'processorresponses': global.SixCRM.routes.path('model', 'functional/register/processorresponses.json'),
			'creditcard':global.SixCRM.routes.path('model', 'entities/creditcard.json')
		};

		this.parameter_definition = {
			'constructor':{
				required:{},
				optional:{
					response_type:'response_type',
					transactions:'transactions',
					processorresponses:'processor_responses',
					creditcard:'creditcard'
				}
			}
		}

		this.initialize();

		this.parameters.setParameters({argumentation: arguments[0], action: 'constructor'});


	}

	setCreditCard(creditcard){

		this.parameters.set('creditcard', creditcard);

	}

	getCreditCard(){

		return this.parameters.get('creditcard', {fatal: false});

	}

	setTransactions(transactions){

		this.parameters.set('transactions', transactions);

	}

	getTransactions(){

		return this.parameters.get('transactions', {fatal: false});

	}

	setProcessorResponses(processor_responses){

		this.parameters.set('processorresponses', processor_responses);

	}

	getProcessorResponses(){

		return this.parameters.get('processorresponses', {fatal: false});

	}

}

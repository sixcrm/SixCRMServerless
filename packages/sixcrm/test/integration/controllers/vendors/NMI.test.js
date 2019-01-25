

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
let objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

function executeReverse(transaction_object){

	let merchant_provider_configuration = getValidMerchantProviderConfiguation();

	const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

	let nmi_controller = new NMIController(merchant_provider_configuration);

	return nmi_controller.reverse(transaction_object);

}

function executeRefund(transaction_object){

	let merchant_provider_configuration = getValidMerchantProviderConfiguation();

	const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

	let nmi_controller = new NMIController(merchant_provider_configuration);

	return nmi_controller.refund(transaction_object);

}

function executeProcess(){

	let merchant_provider_configuration = getValidMerchantProviderConfiguation();

	const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

	let nmi_controller = new NMIController(merchant_provider_configuration);

	let request_parameters = getValidProcessRequestParametersObject();

	return nmi_controller.process(request_parameters);

}

function getValidMerchantProviderConfiguation(){
	return {
		username:"demo",
		password:"password"
	};
}

function getValidProcessRequestParametersObject(){

	return {
		amount: 1.99,
		count: 2,
		creditcard:{
			number:"4111111111111111",
			expiration:"1025",
			cvv:"999",
			name:"Rama Damunaste",
			address:{
				line1:"10 Skid Rw.",
				line2:"Suite 100",
				city:"Portland",
				state:"OR",
				zip:"97213",
				country:"US"
			}
		},
		customer: {
			id: 'randomid',
			firstname: 'John',
			lastname: 'Doe',
			email:'user5@example.com'
		},
		session: {
			ip_address:'10.00.000.90',
		},
		transaction: {
			alias:'ABC123'
		}
	};

}

describe('vendors/merchantproviders/NMI.js', () => {

	it('Should complete a sale', () => {

		return executeProcess().then(response => {

			du.warning(response);

			expect(response).to.have.property('message');
			expect(response).to.have.property('result');
			expect(response).to.have.property('code');

			expect(response.code).to.equal('success');
			expect(response.message).to.equal('SUCCESS');

		});

	});

	//Technical Debt:  This must occur AFTER a successful transaction to get the transaction_id;
	it('Should complete a refund', () => {

		return executeProcess()
			.then(results => {
				return {transaction_id: results.result.transactionid};
			})
			.then((transaction_object) => executeRefund(transaction_object))
			.then(response => {

				expect(response).to.have.property('message');
				expect(response).to.have.property('result');
				expect(response).to.have.property('code');

				expect(response.code).to.equal('success');
				expect(response.message).to.equal('SUCCESS');

			});

	});

	it('Should complete a reverse', () => {

		return executeProcess()
			.then(results => {
				return {transaction_id: results.result.transactionid};
			})
			.then((transaction_object) => executeReverse(transaction_object))
			.then(response => {

				expect(response).to.have.property('message');
				expect(response).to.have.property('result');
				expect(response).to.have.property('code');

				expect(response.code).to.equal('success');
				expect(response.message).to.equal('Transaction Reverse Successful');

			});

	});

});



let chai = require('chai');
let expect = chai.expect;
let du = require('@6crm/sixcrmcore/util/debug-utilities').default;
let objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

function getValidMerchantProviderConfiguation(){
	return {
		username:"timothy.dalbey@sixrm.com",
		password:"vIngelB92SWGNBDHTTQK",
		site_id: "45481",
		merchant_account_id: "47769",
		product_id: "64219"
	};
}

function getValidRequestParametersObject(){

	return {
		amount: 0.99,
		count: 2,
		creditcard: {
			number: '5105105105105100',
			cvv: '123',
			expiration:'12/2014',
			address: {
				line1:'123 Main Street Apt. 1',
				city:'Los Angeles',
				state:'CA',
				zip:'90066',
				country: 'US'
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

function executeProcess(){

	let merchant_provider_configuration = getValidMerchantProviderConfiguation();

	const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

	let innovio_controller = new InnovioController(merchant_provider_configuration);

	let request_parameters = getValidRequestParametersObject();

	return innovio_controller.process(request_parameters);

}

function executeReverse(transaction_object){

	let merchant_provider_configuration = getValidMerchantProviderConfiguation();

	const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

	let innovio_controller = new InnovioController(merchant_provider_configuration);

	return innovio_controller.reverse(transaction_object);

}

function executeRefund(transaction_object){

	let merchant_provider_configuration = getValidMerchantProviderConfiguation();

	const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

	let innovio_controller = new InnovioController(merchant_provider_configuration);

	return innovio_controller.refund(transaction_object);

}


describe('vendors/merchantproviders/Innovio.js', () => {

	it('Should complete a sale', () => {

		return executeProcess().then(response => {

			expect(response).to.have.property('message');
			expect(response).to.have.property('result');
			expect(response).to.have.property('code');

			expect(response.code).to.equal('success');
			expect(response.message).to.equal('APPROVED');

		});

	});

	it('Should complete a refund but result with order not settled advisory', () => {

		return executeProcess()
			.then(results=> {

				du.info(results);

				return {
					transaction_id: results.result.PO_ID,
					li_value_1: results.result.TRANS_VALUE
				};
			})
			.then((transaction_object) => executeRefund(transaction_object))
			.then(response => {

				expect(response).to.have.property('message');
				expect(response).to.have.property('result');
				expect(response).to.have.property('code');

				expect(response.code).to.equal('error');
				expect(response.message).to.equal('Order not settled: Please reverse');

			});

	});

	it('Should complete a reverse', () => {

		return executeProcess()
			.then(results=> {
				return {
					transaction_id: results.result.PO_ID,
					polid1: results.result.PO_LI_ID_1
				};
			})
			.then((transaction_object) => executeReverse(transaction_object))
			.then(response => {

				expect(response).to.have.property('message');
				expect(response).to.have.property('result');
				expect(response).to.have.property('code');

				expect(response.code).to.equal('success');
				expect(response.message).to.equal('APPROVED');

			});

	});

});

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const _ = require('lodash');
let du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
let random = require('@sixcrm/sixcrmcore/util/random').default;
let objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test','unit/lib/permission-test-generators.js');

function getValidMerchantProvider(id){

	return MockEntities.getValidMerchantProvider(id, 'Stripe');

}

describe('live test', async () => {

  describe('process', async () => {

		it('successfully processes a transaction (new customer, existing card)', async () => {

      PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

      let merchant_provider = getValidMerchantProvider();
			merchant_provider.gateway.api_key = 'sk_live_AMHO6C6kwJFGV3GisP6u3yoD';

			let customer = MockEntities.getValidCustomer();
      customer.firstname = 'Timothy';
      customer.lastname = 'Dalbey';
      customer.email = 'tmdalbey@gmail.com'
      customer.phone = '1-503-705-5257';
      customer.address = {
        line1: '6738 N. Willamette Blvd.',
        city: 'Portland',
        state: 'OR',
        zip: '97203',
        country: 'US'
      };

			let creditcard = MockEntities.getValidCreditCard();
			creditcard.number = '379717520961006';
      creditcard.expiration = '05/2020';
      creditcard.first_six = '379717';
      creditcard.last_four = '0006';
      creditcard.name = 'Timothy Dalbey';
      creditcard.cvv = '4567';
      creditcard.address = {
        line1: '6738 N. Willamette Blvd.',
        city: 'Portland',
        state: 'OR',
        zip: '97203',
        country: 'US'
      };


			let amount = (1.00 + (random.randomInt(0, 99) * .01));

			//let charge_response = getValidCreateChargeResponse('success');
			//let source_response = getValidSourceResponse({});
			//let customer_response = getValidCustomerTokenResponse({});

      /*
			let customer_tag = MockEntities.getValidTag();
			customer_tag.key = 'stripe_token';
			customer_tag.value = customer_response.id
			let creditcard_tag = MockEntities.getValidTag();
			creditcard_tag.key = 'stripe_token';
			creditcard_tag.value = source_response.id;
      */

      /*
			mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
				constructor(){}
				listByEntityAndKey({id, key}){
          return Promise.resolve(null);
          expect(id).to.be.defined;
					expect(key).to.be.a('string');
					if(key == 'customer_'+customer.id+'_stripe_source_token'){
						//Note:  Customer is new, can't have a tag.
						return Promise.resolve(null);
					}
					return Promise.resolve(null);

				}
				create({entity}){
					expect(entity).to.be.a('object');
					let tag = MockEntities.getValidTag();
					tag.entity = entity.entity;
					tag.key = entity.key;
					tag.value = entity.value;
					return Promise.resolve(tag);
				}
				update({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
				getID({id}){
					expect(id).to.be.defined;
					if(_.has(id, 'id')){
						return id.id;
					}
					return id;
				}
			});
      /*

			mockery.registerMock(global.SixCRM.routes.path('providers', 'stripe-provider.js'), class {
				constructor(){}
				createCharge(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve({
						error: null,
						response: {
							statusCode: 200,
							statusMessage:'OK',
							body: charge_response
						},
						body: charge_response
					});
				}
				getSource(token){
					expect(token).to.be.a('string');
					expect(token).to.have.string('src_');
					return Promise.resolve(source_response);
				}
				createSource(parameters){
					expect(parameters).to.be.a('object');
					return Promise.resolve(source_response);
				}
				getCustomer(token){
					expect(token).to.be.a('string');
					let error = new Error();
					error.statusCode = 404;
					return Promise.resolve({
						error: error,
						response: {
							statusCode: error.statusCode,
							body: error.message
						},
						body: error.message
					});
				}
				createCustomer(token){
					expect(token).to.be.a('object');
					return Promise.resolve(customer_response);
				}
			});

      */

			const StripeController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/handler.js');
			let stripeController = new StripeController({merchant_provider: merchant_provider});

			let result = await stripeController.process({customer: customer, creditcard: creditcard, amount: amount});

      du.info(result);

			expect(result.getResult()).to.have.property('code');
			expect(result.getResult()).to.have.property('message');
			expect(result.getResult()).to.have.property('response');
			expect(result.getResult().code).to.equal('success');
			expect(result.getResult().message).to.equal('Success');

    });

  });

});

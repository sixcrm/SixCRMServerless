
const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const uuidV4 = require('uuid/v4');

const random = require('@6crm/sixcrmcore/lib/util/random').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

describe('/helpers/entities/TrialConfirmation.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('confirmTrialDelivery', async () => {


		it('successfully confirms a trial', async () => {

			const session = MockEntities.getValidSession();
			session.trial_confirmation = uuidV4();
			const customer = MockEntities.getValidCustomer(session.customer);
			const trialConfirmation = MockEntities.getValidTrialConfirmation(session.trial_confirmation);

			mockery.registerMock('@root/controllers/entities/Session.js', class {
				constructor(){}
				get({id}){
					expect(id).to.equal(session.id);
					return Promise.resolve(session);
				}
				updateProperties(){
					return Promise.resolve();
				}
			});

			mockery.registerMock('@root/controllers/entities/Customer.js', class {
				constructor(){}
				get({id}){
					expect(id).to.equal(customer.id);
					return Promise.resolve(customer);
				}
			});

			mockery.registerMock('@root/controllers/entities/TrialConfirmation.js', class {
				constructor(){}
				get({id}){
					expect(id).to.equal(trialConfirmation.id);
					return Promise.resolve(trialConfirmation);
				}
				markDelivered({confirmation}) {
					expect(confirmation.id).to.equal(trialConfirmation.id);
					confirmation.delivered_at = timestamp.getISO8601();
					return Promise.resolve(confirmation);
				}
			});

			mockery.registerMock('@root/controllers/entities/SMSProvider.js', class {
				constructor(){}
				sendSMS(provider_id, phone, message){
					expect(provider_id).to.equal(trialConfirmation.sms_provider);
					expect(phone).to.equal(customer.phone);
					expect(message).to.be.a('string');
					return Promise.resolve(customer);
				}
			});

			const TrialConfirmationHelper = require('../../../../../../lib/controllers/helpers/entities/trialconfirmation/TrialConfirmation').default;

			const trialConfirmationHelper = new TrialConfirmationHelper();

			const result = await trialConfirmationHelper.confirmTrialDelivery(session.id);

			expect(result).to.be.an('object');
		});

		it('throws an error if session has no trial confirmation associated', async () => {

			const session = MockEntities.getValidSession();

			mockery.registerMock('@root/controllers/entities/Session.js', class {
				constructor(){}
				get({id}){
					expect(id).to.equal(session.id);
					return Promise.resolve(session);
				}
			});

			const TrialConfirmationHelper = require('../../../../../../lib/controllers/helpers/entities/trialconfirmation/TrialConfirmation').default;

			const trialConfirmationHelper = new TrialConfirmationHelper();

			try {
				await trialConfirmationHelper.confirmTrialDelivery(session.id);
				assert.fail('should throw an error');
			} catch (e) {
				expect(e).to.be.an('error');
				return;
			}

			assert.fail('Should have thrown an error')
		});

		it('throws an error if confirmation is already confirmed', async () => {

			const session = MockEntities.getValidSession();
			session.trial_confirmation = uuidV4();
			const customer = MockEntities.getValidCustomer(session.customer);
			const trialConfirmation = MockEntities.getValidTrialConfirmation(session.trial_confirmation);
			trialConfirmation.confirmed_at = timestamp.getISO8601();

			mockery.registerMock('@root/controllers/entities/Session.js', class {
				constructor(){}
				get({id}){
					expect(id).to.equal(session.id);
					return Promise.resolve(session);
				}
			});

			mockery.registerMock('@root/controllers/entities/Customer.js', class {
				constructor(){}
				get({id}){
					expect(id).to.equal(customer.id);
					return Promise.resolve(customer);
				}
			});

			mockery.registerMock('@root/controllers/entities/TrialConfirmation.js', class {
				constructor(){}
				get({id}){
					expect(id).to.equal(trialConfirmation.id);
					return Promise.resolve(trialConfirmation);
				}
			});

			const TrialConfirmationHelper = require('../../../../../../lib/controllers/helpers/entities/trialconfirmation/TrialConfirmation').default;

			const trialConfirmationHelper = new TrialConfirmationHelper();

			try {
				await trialConfirmationHelper.confirmTrialDelivery(session.id);
			} catch (e) {
				expect(e).to.be.an('error');
				return;
			}

			assert.fail('Should have thrown an error')
		});


	});

});

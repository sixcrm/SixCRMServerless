const td = require('testdouble');
const chai = require("chai");
const expect = chai.expect;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

let billingFailureController, AccountHelperController, RebillController, SessionController;

describe('controllers/workers/statemachine/billingFailure.js', () => {
  beforeEach(() => {
		AccountHelperController = td.replace('../../../../../controllers/helpers/entities/account/Account');
		RebillController = td.replace('../../../../../controllers/entities/Rebill');
		SessionController = td.replace('../../../../../controllers/entities/Session');

		const BillingFailureController = require('../../../../../controllers/workers/statemachine/billingFailure');
		billingFailureController = new BillingFailureController();
	});

	afterEach(() => {
		td.reset();
	});

  describe('execute', async () => {
		it('succeeds', async () => {
			const rebill = MockEntities.getValidRebill();
			td.when(RebillController.prototype.get({id: rebill.id})).thenResolve(rebill);
			await billingFailureController.execute(rebill.id);
		});

		context('when bill account is SIX Accounting', () => {
			it('triggers deactivation', async () => {
				const rebill = MockEntities.getValidRebill();
				rebill.account = '3f4abaf6-52ac-40c6-b155-d04caeb0391f'
				const session = MockEntities.getValidSession();
				const account = MockEntities.getValidAccount();
				td.when(RebillController.prototype.get({id: rebill.id})).thenResolve(rebill);
				td.when(SessionController.prototype.get({id: rebill.parentsession})).thenResolve(session);
				td.when(AccountHelperController.prototype.getAccountForCustomer(session.customer)).thenResolve(account);
				td.when(AccountHelperController.prototype.scheduleDeactivation(account)).thenResolve();
				await billingFailureController.execute(rebill.id);
			});
		});
  });
});

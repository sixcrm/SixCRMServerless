const mockery = require('mockery');
let chai = require('chai');
const expect = chai.expect;

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
//const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('constrollers/helpers/entities/account/Account.js', () => {

  beforeEach(() => {
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

  describe('constructor', () => {
    it('successfully constructs', () => {

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      expect(objectutilities.getClassName(accountHelperController)).to.equal('AccountHelperController');

    });
  });

  xdescribe('upgradeAccount', () => {

    it('successfully upgrades a account', () => {

      let account = MockEntities.getValidAccount();
      let session = MockEntities.getValidSession();

      account.billing = {
        session: session.id,
        plan: 'basic'
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Account.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        update({entity, allow_billing_overwrite}){
          expect(entity).to.be.a('object');
          expect(allow_billing_overwrite).to.be.a('boolean');
          return Promise.resolve(entity);
        }
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(account);
        }

      });

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      return accountHelperController.upgradeAccount({account: account.id, plan: 'premium'}).then(result => {
        expect(result).to.have.property('message');
      });

    });

  });

  describe('cancelDeactivation', () => {

    it('successfully cancels a scheduled deactivation', () => {

      let account = MockEntities.getValidAccount();
      let session = MockEntities.getValidSession();

      account.billing = {
        deactivate: timestamp.getISO8601(),
        session: session.id,
        plan: 'basic'
      }

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Account.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        update({entity, allow_billing_overwrite}){
          expect(entity).to.be.a('object');
          expect(allow_billing_overwrite).to.be.a('boolean');
          return Promise.resolve(entity);
        }
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(account);
        }

      });

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      return accountHelperController.cancelDeactivation({account: account.id}).then(result => {
        expect(result).to.have.property('message');
        expect(result.message).to.equal('Deactivation Cancelled');
      });

    });

  });



  describe('deactivateAccount', () => {
    it('successfully schedules a account for deactivation', () => {

      let account = MockEntities.getValidAccount();
      let session = MockEntities.getValidSession();

      account.billing = {
        session: session.id,
        plan: 'basic'
      }

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Account.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        update({entity, allow_billing_overwrite}){
          expect(entity).to.be.a('object');
          expect(allow_billing_overwrite).to.be.a('boolean');
          return Promise.resolve(entity);
        }
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(account);
        }

      });

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      return accountHelperController.deactivateAccount({account: account.id}).then(result => {
        expect(result).to.have.property('message');
        expect(result).to.have.property('deactivate');
        expect(result.deactivate).to.be.a('string');
      });

    });

  });

  describe('activateAccount', () => {
    it('successfully activates a account', () => {

      let account  = MockEntities.getValidAccount();
      let session = MockEntities.getValidSession();
      let customer = MockEntities.getValidCustomer();
      let owner_acl = MockEntities.getValidUserACL();
      let rebill = MockEntities.getValidRebill();
      let rebills = [rebill];
      let transaction = MockEntities.getValidTransaction();
      rebill.amount = transaction.amount;
      let transactions = [transaction];

      owner_acl.role = 'cae614de-ce8a-40b9-8137-3d3bdff78039'
      owner_acl.user = customer.email;
      let user_acls = [owner_acl];

      session.account = '3f4abaf6-52ac-40c6-b155-d04caeb0391f';
      session.watermark = {
        product_schedules: [
          {
            product_schedule: {
              schedule: [
                {
                  quantity: 1,
                  product: {
                    id: '3ac1a59a-6e41-4074-9712-3c80ef3f3e95'
                  }
                }
              ]
            },
            quantity: 1
          }
        ]
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
        getCustomer(session){
          expect(session).to.be.a('object');
          return Promise.resolve(customer);
        }
        listRebills(session){
          expect(session).to.be.a('object');
          return Promise.resolve(rebills);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Account.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        update({entity, allow_billing_overwrite}){
          expect(entity).to.be.a('object');
          expect(allow_billing_overwrite).to.be.a('boolean');
          return Promise.resolve(entity);
        }
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(account);
        }

      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'UserACL.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        getACLByAccount({account}){
          expect(account).to.be.a('object');
          return Promise.resolve(user_acls);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        listTransactions(rebill){
          expect(rebill).to.be.a('object');
          return Promise.resolve(transactions);
        }
      });

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      return accountHelperController.activateAccount({account: account.id, session: session.id}).then(result => {
        expect(result).to.have.property('message');
        expect(result).to.have.property('activated');
        expect(result.activated).to.equal(true);
      });

    });
  });
});

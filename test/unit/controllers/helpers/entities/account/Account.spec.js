const mockery = require('mockery');
let chai = require('chai');
const expect = chai.expect;

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

  describe('activateAccount', () => {
    it('successfully activates a account', () => {

      let account  = MockEntities.getValidAccount();
      let session = MockEntities.getValidSession();
      session.account = '3f4abaf6-52ac-40c6-b155-d04caeb0391f';
      session.watermark = {
        product_schedules: [
          {
            schedule: [
              {
                quantity: 1,
                product: {
                  id: '3ac1a59a-6e41-4074-9712-3c80ef3f3e95'
                }
              }
            ]
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

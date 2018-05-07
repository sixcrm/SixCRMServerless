const mockery = require('mockery');
let chai = require('chai');
const expect = chai.expect;

//const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
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

      const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');
      let roleHelperController = new RoleHelperController();

      expect(objectutilities.getClassName(roleHelperController)).to.equal('RoleHelperController');

    });
  });

  describe('getDisabledRole', () => {

    it('successfully retireves the disabled role', () => {

      let role = MockEntities.getValidRole();
      mockery.registerMock(global.SixCRM.routes.path('entities','Role.js'), class {
        constructor(){}
        getShared({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(role);
        }
      });

      const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');
      let roleHelperController = new RoleHelperController();

      return roleHelperController.getDisabledRole().then(result => {
        expect(result).to.be.a('object');
        expect(result).to.have.property('id');
      });

    });

  });

  describe('roleIntersection', () => {

    it('returns the intersectional role', () => {

      let role1 = MockEntities.getValidRole();
      let role2 = MockEntities.getValidRole();

      const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');
      let roleHelperController = new RoleHelperController();

      return roleHelperController.roleIntersection(role1, role2).then(result => {
        expect(result).to.be.a('object');
      });

    });

  });

});

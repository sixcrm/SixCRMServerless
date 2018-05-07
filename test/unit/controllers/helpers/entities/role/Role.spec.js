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
        getUnsharedOrShared({id}){
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

    it('returns the intersectional role (r1 *)', () => {

      let role1 = MockEntities.getValidRole();
      role1.permissions.allow = [
        '*',
      ];
      let role2 = MockEntities.getValidRole();
      role2.permissions.allow = [
        'product/*',
      ];

      const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');
      let roleHelperController = new RoleHelperController();

      let result = roleHelperController.roleIntersection(role1, role2);
      expect(result).to.be.a('object');
      expect(result.name).to.be.a('string');
      expect(result.name).to.equal(role1.name+' - '+role2.name);
      expect(result.permissions.allow).to.deep.equal(['product/*']);
    });

  });

  it('returns the intersectional role (r2 *)', () => {

    let role1 = MockEntities.getValidRole();
    let role2 = MockEntities.getValidRole();
    role1.permissions.allow = [
      'product/*',
    ];
    role2.permissions.allow = [
      '*',
    ];

    const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');
    let roleHelperController = new RoleHelperController();

    let result = roleHelperController.roleIntersection(role1, role2);
    expect(result).to.be.a('object');
    expect(result.name).to.be.a('string');
    expect(result.name).to.equal(role1.name+' - '+role2.name);
    expect(result.permissions.allow).to.deep.equal(['product/*']);

  });

  it('returns the intersectional role (no intersection)', () => {

    let role1 = MockEntities.getValidRole();
    let role2 = MockEntities.getValidRole();
    role1.permissions.allow = [
      'product/*',
    ];
    role2.permissions.allow = [
      'campaign/read',
    ];

    const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');
    let roleHelperController = new RoleHelperController();

    let result = roleHelperController.roleIntersection(role1, role2);
    expect(result).to.be.a('object');
    expect(result.name).to.be.a('string');
    expect(result.name).to.equal(role1.name+' - '+role2.name);
    expect(result.permissions.allow).to.deep.equal([]);

  });

  it('returns the intersectional role (perfect intersection)', () => {

    let role1 = MockEntities.getValidRole();
    let role2 = MockEntities.getValidRole();
    role1.permissions.allow = [
      'campaign/read',
    ];
    role2.permissions.allow = [
      'campaign/read',
    ];

    const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');
    let roleHelperController = new RoleHelperController();

    let result = roleHelperController.roleIntersection(role1, role2);
    expect(result).to.be.a('object');
    expect(result.name).to.be.a('string');
    expect(result.name).to.equal(role1.name+' - '+role2.name);
    expect(result.permissions.allow).to.deep.equal(['campaign/read']);

  });

  it('returns the intersectional role (larger case)', () => {

    let role1 = getAdministratorRole();
    let role2 = getDisabledRole();
    let expected = {
      name: 'Administrator - Disabled Role',
      active: true,
      permissions:{
        allow:[
          'account/*',
          'bill/*',
          'creditcard/*',
          'customer/*',
          'customernote/*',
          'rebill/*',
          'return/*',
          'session/*',
          'shippingreceipt/*',
          'transaction/*'
        ],
        deny: [ '*' ] }
    };

    const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');
    let roleHelperController = new RoleHelperController();

    let result = roleHelperController.roleIntersection(role1, role2);
    expect(result).to.be.a('object');
    expect(result.name).to.be.a('string');
    expect(result.name).to.equal(role1.name+' - '+role2.name);
    expect(result.permissions.allow).to.deep.equal(expected.permissions.allow);
    expect(result.permissions.deny).to.deep.equal(expected.permissions.deny);
    expect(result).to.deep.equal(expected);

  });

});

function getAdministratorRole(){
  return {
  	"id":"e09ac44b-6cde-4572-8162-609f6f0aeca8",
  	"account": "*",
  	"name": "Administrator",
  	"active":true,
  	"permissions":{
  		"allow":[
  			"analytics/*",
  			"accesskey/*",
  			"affiliate/*",
  			"account/*",
  			"bill/*",
  			"campaign/*",
  			"creditcard/*",
  			"customer/*",
  			"customernote/*",
  			"emailtemplate/*",
  			"merchantprovidergroup/*",
  			"merchantprovidergroupassociation/*",
  			"merchantprovider/*",
  			"productschedule/*",
  			"product/*",
  			"rebill/*",
  			"return/*",
  			"role/read",
  			"session/*",
  			"shippingreceipt/*",
  			"smtpprovider/*",
  			"transaction/*",
  			"notification/*",
  			"notificationread/*",
  			"notificationsetting/*",
  			"user/*",
  			"useracl/*",
  			"usersetting/*",
  			"usersigningstring/*",
  			"userdevicetoken/*",
  			"tracker/*",
  			"register/*",
  			"fulfillmentprovider/*"
  		],
  		"deny":["*"]
  	},
  	"created_at":"2017-04-06T18:40:41.405Z",
  	"updated_at":"2017-04-06T18:41:12.521Z"
  };

}

function getDisabledRole(){

  return {
  	"id":"78e507dd-93fc-413b-b21a-819480209740",
  	"account": "*",
  	"name": "Disabled Role",
  	"active":true,
  	"permissions":{
  		"allow":[
  			"account/*",
  			"bill/*",
  			"customer/*",
  			"session/*",
  			"creditcard/*",
  			"customernote/*",
  			"rebill/*",
  			"return/*",
  			"shippingreceipt/*",
  			"transaction/*"
  		],
  		"deny":["*"]
  	},
  	"created_at":"2017-04-06T18:40:41.405Z",
  	"updated_at":"2017-04-06T18:41:12.521Z"
  };

}

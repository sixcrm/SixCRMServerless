'use strict'
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const PermissionedController = global.SixCRM.routes.include('controllers','entities/Entity');
const PermissionTestGenerators = require('../../../../unit/lib/permission-test-generators');


describe('controllers/helpers/permission/Permissioned.js', () => {

  let permissionedController;

  before(() => {
      mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
      });
  });

  beforeEach(() => {
    //global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('can', () => {

    beforeEach(() => {
      permissionedController = new PermissionedController('entity');
    });

    afterEach(() => {
      delete global.user;
    });

    it('fails when user is not defined', () => {

      let some_action = 'action_x';
      let some_object = 'object_y'

      try{

        permissionedController.can({action: some_action, object: some_object});

      }catch(error){

        expect(error.message).to.equal('[500] Global is missing the user property.');

      }


    });

    it('fails when user is denied for action', () => {

      let some_action = 'action_x';
      let some_object = 'object_y'

      PermissionTestGenerators.givenUserWithDenied(some_action, some_object);

      try {

        permissionedController.can({action: some_action, object: some_object});

      }catch(error){

        expect(error.message).to.equal('[500] Unexpected ACL object structure:  Empty role.permission.allow object.');

      }

    });

    it('fails when user is not allowed for action', () => {

      let some_action = 'action_x';
      let some_object = 'object_y';

      PermissionTestGenerators.givenUserWithNoPermissions();

      try {
        permissionedController.can({action: some_action, object: some_object});
      }catch(error){
        expect(error.message).to.equal('[500] Unexpected ACL object structure:  Empty role.permission.allow object.');
      }

    });

    it('succeeds when user is allowed for action', () => {

      let some_action = 'action_x';
      let some_object = 'object_y';

      PermissionTestGenerators.givenUserWithAllowed(some_action, some_object);

      return permissionedController.can({action: some_action, object: some_object}).then((can) => {

        expect(can).to.equal(true);

      });

    });

  });

  describe('disableACLs/enableACLs', () => {

    beforeEach(() => {
      permissionedController = new PermissionedController('entity');
    });

    afterEach(() => {
      delete global.user;
      global.disableactionchecks = false;
      global.disableaccountfilter = false;
    });

    it('successfully disables the acls', () => {

      permissionedController.disableACLs();
      expect(global.disableactionchecks).to.equal(true);
      expect(global.disableaccountfilter).to.equal(true);

    });

    it('successfully disables and then enables the acls', () => {

      permissionedController.disableACLs();
      expect(global.disableactionchecks).to.equal(true);
      expect(global.disableaccountfilter).to.equal(true);
      permissionedController.enableACLs();
      expect(global.disableactionchecks).to.equal(false);
      expect(global.disableaccountfilter).to.equal(false);

    });

  });

  describe('setGlobalUser/unsetGlobalUser', () => {

    beforeEach(() => {
      permissionedController = new PermissionedController('entity');
    });

    afterEach(() => {
      delete global.user;
    });

    it('successfully sets/unsets a user object', () => {

      let user = {id: 'some@testuser.com'}

      permissionedController.setGlobalUser(user);
      expect(global.user).to.deep.equal(user);
      permissionedController.unsetGlobalUser();
      expect(global.user).to.not.be.defined;

    });

    it('successfully sets/unsets a user email', () => {

      let user = 'some@testuser.com';

      permissionedController.setGlobalUser(user);
      expect(global.user).to.equal(user);
      permissionedController.unsetGlobalUser();
      expect(global.user).to.not.be.defined;

    });

  });

});

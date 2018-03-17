'use strict'
const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib','array-utilities.js');
describe('helpers/context/Context.js', () => {
  describe('constructor', () => {
    it('successfully constructs', () => {
      const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
      let contextHelperController = new ContextHelperController();
      expect(objectutilities.getClassName(contextHelperController)).to.equal('ContextHelperController');
    });
  });

  describe('getFromContext', () => {
    it('successfully retrieves objects from context', () => {
      const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
      let contextHelperController = new ContextHelperController();

      let desired_user = 'some@user.com';

      let contexts = [
        {
          user:{ id: desired_user }
        },
        {
          user: { id: desired_user },
          account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
        }
      ];

      arrayutilities.map(contexts, context => {
        let user = contextHelperController.getFromContext(context, 'user.id', 'id');
        expect(user).to.equal(desired_user);
      });

    });

    it('successfully retrieves objects from context', () => {
      const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
      let contextHelperController = new ContextHelperController();

      let desired_user = 'some@user.com';

      let contexts = [
        {
          user: desired_user
        }
      ];

      arrayutilities.map(contexts, context => {
        let user = contextHelperController.getFromContext(context, 'user', 'id');
        expect(user).to.equal(desired_user);
      });

    });

  });
});

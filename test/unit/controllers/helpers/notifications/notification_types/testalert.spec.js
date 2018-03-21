'use strict'
const _ = require('underscore');
//const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib','array-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
//const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

let notification_name = 'testalert';
let notification_readable_name = 'TestAlert';

describe('/helpers/notifications/notification_types/'+notification_name+'.js', () => {

  describe('constructor', () => {
    it('successfully constructs', () => {
      let notification_class = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/'+notification_name+'.js');

      expect(objectutilities.getClassName(notification_class)).to.equal(notification_readable_name+'Notification');

    });
  });

  describe('transformContext', () => {

    let required_fields = ['account','type','category','context'];

    it('successfully transforms the context object', () => {

      let context = {
        user: { id: 'owner.user@test.com' },
        account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
      };

      let notification_class = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/'+notification_name+'.js');
      let transformed_context = notification_class.transformContext(context);

      arrayutilities.map(required_fields, key => {
        expect(transformed_context).to.have.property(key);
      });

      if(!_.has(notification_class, 'account_wide')){
        expect(transformed_context).to.have.property('user');
        expect(transformed_context.user).to.not.equal(null);
      }

      du.highlight(transformed_context);

    });

  });

});

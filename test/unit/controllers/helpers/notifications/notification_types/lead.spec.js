'use strict'
const _ = require('underscore');
//const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib','array-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('/helpers/notifications/notification_types/lead.js', () => {

  describe('constructor', () => {
    it('successfully constructs', () => {
      let notification_class = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/lead.js');

      expect(objectutilities.getClassName(notification_class)).to.equal('LeadNotification');
    });
  });

  describe('transformContext', () => {

    let required_fields = ['account','type','category','context'];

    it('successfully transforms the context object', () => {

      let campaign = MockEntities.getValidCampaign();
      let customer = MockEntities.getValidCustomer();

      let context = {
        user: 'owner.user@test.com',
        account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
        campaign: campaign,
        customer: customer
      };

      let notification_class = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/lead.js');
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

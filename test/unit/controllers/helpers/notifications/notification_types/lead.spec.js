'use strict'
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
      let leadNotification = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/lead.js');

      expect(objectutilities.getClassName(leadNotification)).to.equal('LeadNotification');
    });
  });

  describe('transformContext', () => {

    let required_fields = ['user','account','type','category','title','body','action'];

    it('successfully transforms the context object', () => {

      let campaign = MockEntities.getValidCampaign();
      let customer = MockEntities.getValidCustomer();

      let context = {
        user: 'owner.user@test.com',
        account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',

        campaign: campaign,
        customer: customer
      };

      let leadNotification = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/lead.js');
      let transformed_context = leadNotification.transformContext(context);

      arrayutilities.map(required_fields, key => {
        expect(transformed_context).to.have.property(key);
      });

      du.highlight(transformed_context);

    });
  });

  describe('triggerNotifications', () => {
    it('successfully triggers notifications', () => {
      //triggerNotifications(transformed_context)
    });
  });
});

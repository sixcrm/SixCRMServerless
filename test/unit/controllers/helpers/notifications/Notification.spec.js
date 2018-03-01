'use strict'
//const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
//const du = global.SixCRM.routes.include('lib','debug-utilities.js');

describe('/helpers/notifications/Notification.js', () => {
  describe('constructor', () => {
    it('successfully constructs', () => {

      const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
      let notificationHelperClass = new NotificationHelperClass();

      expect(objectutilities.getClassName(notificationHelperClass)).to.equal('NotificationHelperClass');

    });
  });

  describe('isNotificationEventType', () => {

    it('returns true for valid notification types', () => {

      let event_type = 'test';
      const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
      let notificationHelperClass = new NotificationHelperClass();

      notificationHelperClass.parameters.set('eventtype', event_type);

      expect(notificationHelperClass.isNotificationEventType()).to.equal(true);

    });

    it('throws a 404 error when notification type is not recognized', () => {

      let event_type = 'test';
      const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
      let notificationHelperClass = new NotificationHelperClass();

      notificationHelperClass.parameters.set('eventtype', event_type);

      try {
        notificationHelperClass.isNotificationEventType();
      }catch(error){
        expect(error.statusCode).to.equal(404);
      }

    });

  });

  describe('instantiateNotificationClass', () => {

    it('successfully instantiates the default notification class', () => {

      let event_type = 'default';
      const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
      let notificationHelperClass = new NotificationHelperClass();

      notificationHelperClass.parameters.set('eventtype', event_type);

      notificationHelperClass.instantiateNotificationClass();

      expect(objectutilities.getClassName(notificationHelperClass.parameters.get('notificationclass'))).to.equal('DefaultNotification');

    });

    it('successfully instantiates the test notification class', () => {

      let event_type = 'test';
      const NotificationHelperClass = global.SixCRM.routes.include('helpers','notifications/Notification.js');
      let notificationHelperClass = new NotificationHelperClass();

      notificationHelperClass.parameters.set('eventtype', event_type);

      notificationHelperClass.instantiateNotificationClass();

      expect(objectutilities.getClassName(notificationHelperClass.parameters.get('notificationclass'))).to.equal('TestNotification');

    });

  });

  /*
  instantiateNotificationClass(){

    du.debug('Instantiate Notification Class');

    let event_type = this.parameters.get('eventtype');

    let notification_class = global.SixCRM.routes.include('helpers', 'default.js');

    if(fileutilities.fileExists(global.SixCRM.routes.path('helpers', 'notifications/notificationtypes/'+event_type+'.js'))){

      notification_class = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/'+event_type+'.js');

    }

    this.parameters.set('notificationclass', notification_class);

  }
  */

});

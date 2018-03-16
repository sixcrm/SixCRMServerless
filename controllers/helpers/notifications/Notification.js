'use strict'

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class NotificationHelperClass {

  constructor(){

    //Technical Debt:  Need to add validation schemas here...
    this.parameter_validation = {};

    this.parameter_definition = {
      executeNotifications:{
        required:{
          eventtype: 'event_type',
          context: 'context'
        },
        optional:{}
      }
    };

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

  }

  executeNotifications(){

    du.debug('Execute Notifications');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'executeNotifications'}))
    .then(() => this.isNotificationEventType())
    .then(() => this.instantiateNotificationClass())
    .then(() => this.transformContext())
    .then(() => this.executeNotificationActions())
    .catch((error) => {
      if(error.statusCode == 404){
        return Promise.resolve(true);
      }
      du.error(error);
      return Promise.reject(error);
    });

  }

  isNotificationEventType(){

    du.debug('Is Notification Event Type');

    let event_type = this.parameters.get('eventtype');

    let valid_event_type = mvu.validateModel(event_type, global.SixCRM.routes.path('model', 'helpers/notifications/notificationevent.json'), null, false);

    if(valid_event_type == true){
      return true;
    }

    eu.throwError('not_found','Not a notification event type: '+event_type);

  }

  instantiateNotificationClass(){

    du.debug('Instantiate Notification Class');

    let event_type = this.parameters.get('eventtype');

    let notification_class = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/default.js');

    if(fileutilities.fileExists(global.SixCRM.routes.path('helpers', 'notifications/notificationtypes/'+event_type+'.js'))){

      notification_class = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/'+event_type+'.js');

    }

    this.parameters.set('notificationclass', notification_class);

    return true;

  }

  transformContext(){

    du.debug('Transform Context');

    let context = this.parameters.get('context');
    let notification_class = this.parameters.get('notificationclass');

    let transformed_context = notification_class.transformContext(context);

    this.parameters.set('transformedcontext', transformed_context);

    return true;

  }

  executeNotificationActions(){

    du.debug('Execute Notification Actions');

    let transformed_context = this.parameters.get('transformedcontext');
    let notification_class = this.parameters.get('notificationclass');

    return notification_class.triggerNotifications(transformed_context);

  }

}

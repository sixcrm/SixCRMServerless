'use strict';
require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const sendNotificationsController = global.SixCRM.routes.include('controllers', 'workers/sendNotifications.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.sendnotifications = (event, context, callback) => {

  sendNotificationsController.execute(event).then((result) => {

    if(result !== sendNotificationsController.messages.success && result !== sendNotificationsController.messages.successnoaction){

      new LambdaResponse().issueResponse(200, {
        message: result
      }, callback);

    }else{

      sendNotificationsController.createForwardMessage(event).then((forward_object) => {
        new LambdaResponse().issueResponse(200, {
          message: result,
          forward: forward_object
        }, callback);
      });

    }

  }).catch((error) => {

    du.error(error);

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}

'use strict';
require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const sendNotificationController = global.SixCRM.routes.include('controllers', 'workers/sendNotifications.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.sendnotification = (event, context, callback) => {

  sendNotificationController.execute(event).then((result) => {

    if(result !== sendNotificationController.messages.success && result !== sendNotificationController.messages.successnoaction){

      new LambdaResponse().issueResponse(200, {
        message: result
      }, callback);

    }else{

      sendNotificationController.createForwardMessage(event).then((forward_object) => {
        new LambdaResponse().issueResponse(200, {
          message: result,
          forward: forward_object
        }, callback);
      });

    }

  }).catch((error) => {

    du.warning('Send Notification Catch Error', error);

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}

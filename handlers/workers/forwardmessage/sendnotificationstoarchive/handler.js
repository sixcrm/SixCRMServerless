'use strict';

module.exports = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
  const SendNotificationsToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/sendNotificationsToArchivedForwardMessage.js');
  const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

  du.debug('Executing Send Notifications To Archived Forward Message Controller');

  return executor(new SendNotificationsToArchivedForwardMessageController(), event, callback);

};

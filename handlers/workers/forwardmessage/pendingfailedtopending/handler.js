'use strict';
require('../../../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const PendingFailedToPendingForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pendingFailedToPendingForwardMessage.js');
const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

module.exports.pendingfailedtopending = (event, context, callback) => {

  du.debug('Executing Pending Failed To Pending Forward Message Controller');

  return executor(new PendingFailedToPendingForwardMessageController(), event, callback);

};

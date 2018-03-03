'use strict';

module.exports.pendingtoshipped = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
  const PendingToShippedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pendingToShippedForwardMessage.js');
  const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

  du.debug('Executing Pending To Shipped Forward Message Controller');

  return executor(new PendingToShippedForwardMessageController(), event, callback);

};

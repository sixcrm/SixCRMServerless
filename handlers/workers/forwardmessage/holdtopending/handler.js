'use strict';

module.exports.holdtopending = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
  const HoldToPendingForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/holdToPendingForwardMessage.js');
  const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

  du.debug('Executing Hold To Pending Forward Message Controller');

  return executor(new HoldToPendingForwardMessageController(), event, callback);

};

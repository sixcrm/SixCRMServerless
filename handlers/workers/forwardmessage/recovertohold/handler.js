'use strict';
require('../../../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHold.js');
const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

module.exports.recovertohold = (event, context, callback) => {

  du.debug('Executing Recover To Hold Forward Message Controller');

  return executor(new RecoverToHoldForwardMessageController(), event, callback);

};

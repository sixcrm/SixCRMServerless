'use strict';
require('../../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

module.exports = (event, context, callback) => {

  du.debug('Executing Bill To Hold Forward Message Controller');

  return executor(new BillToHoldForwardMessageController(), event, callback);

};
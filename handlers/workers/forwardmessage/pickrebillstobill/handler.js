'use strict';

module.exports.pickrebillstoboll = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
  const PickRebillsToBillForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pickRebillsToBill.js');
  const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

  du.debug('Executing Pick Rebills To Bill Forward Message Controller');

  return executor(new PickRebillsToBillForwardMessageController(), event, callback);

};

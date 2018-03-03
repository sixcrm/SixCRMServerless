'use strict';

module.exports = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
  const RecoverToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
  const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

  du.debug('Executing Recover To Archived Forward Message Controller');

  return executor(new RecoverToArchivedForwardMessageController(), event, callback);

};

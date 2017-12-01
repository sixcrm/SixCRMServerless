'use strict';
require('../../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const RecoverToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

module.exports = (event, context, callback) => {

  du.debug('Executing Recover To Archived Forward Message Controller');

  return executor(new RecoverToArchivedForwardMessageController(), event, callback);

};

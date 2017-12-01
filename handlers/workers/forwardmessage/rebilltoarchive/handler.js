'use strict';
require('../../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const RebillToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/rebillToArchivedForwardMessage.js');
const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

module.exports = (event, context, callback) => {

  du.debug('Executing Rebill To Archived Forward Message Controller');

  return executor(new RebillToArchivedForwardMessageController(), event, callback);

};

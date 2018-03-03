'use strict';

module.exports.deliveredtoarchive = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
  const DeliveredToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/deliveredToArchive.js');
  const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

  du.debug('Executing Delivered To Archived Forward Message Controller');

  return executor(new DeliveredToArchiveForwardMessageController(), event, callback);

};

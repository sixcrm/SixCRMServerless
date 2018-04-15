

module.exports.indextoarchive = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
  const IndexToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/indexToArchivedForwardMessage.js');
  const executor = global.SixCRM.routes.include('handlers', 'workers/forwardmessage/forwardMessageExecutor.js');

  du.debug('Executing Index To Archived Forward Message Controller');

  return executor(new IndexToArchivedForwardMessageController(), event, callback);

};

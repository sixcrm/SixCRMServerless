'use strict';
require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const PickRebillsToBillForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pickRebillsToBill.js');
const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHoldForwardMessage.js');
const HoldToPendingForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/holdToPendingForwardMessage.js');
const PendingFailedToPendingForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pendingFailedToPendingForwardMessage.js');
const PendingToShippedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pendingToShippedForwardMessage.js');
const ShippedToDeliveredForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/shippedToDeliveredForwardMessage.js');
const DeliveredToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/deliveredToArchivedForwardMessage.js');
const HoldToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/holdToArchivedForwardMessage.js');
const RebillToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/rebillToArchivedForwardMessage.js');
const RecoverToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
const IndexToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/indexToArchivedForwardMessage.js');
const SendNotificationsToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/sendNotificationsToArchivedForwardMessage.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.pickrebillstobill = (event, context, callback) => {

  const controller = new PickRebillsToBillForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.billtohold = (event, context, callback) => {

  const controller = new BillToHoldForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.recovertohold = (event, context, callback) => {

  const controller = new RecoverToHoldForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.holdtopending = (event, context, callback) => {

  const controller = new HoldToPendingForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.pendingfailedtopending = (event, context, callback) => {

  const controller = new PendingFailedToPendingForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.pendingtoshipped = (event, context, callback) => {

  const controller = new PendingToShippedForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.shippedtodelivered = (event, context, callback) => {

  const controller = new ShippedToDeliveredForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.deliveredtoarchive = (event, context, callback) => {

  const controller = new DeliveredToArchivedForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.holdtoarchive = (event, context, callback) => {

  const controller = new HoldToArchivedForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.rebilltoarchive = (event, context, callback) => {

  const controller = new RebillToArchivedForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.recovertoarchive = (event, context, callback) => {

  const controller = new RecoverToArchivedForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.indextoarchive = (event, context, callback) => {

  const controller = new IndexToArchivedForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

module.exports.sendnotificationstoarchive = (event, context, callback) => {

  const controller = new SendNotificationsToArchivedForwardMessageController();

  return executeForwardMessageController(controller, event, callback);

};

function executeForwardMessageController(controller, event, callback) {
  return controller.execute().then(() => {

    new LambdaResponse().issueResponse(200, {}, callback);

  }).catch((error) =>{

    new LambdaResponse().issueError(error.message, event, callback);

  });
}

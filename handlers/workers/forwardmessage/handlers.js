const ForwardMessageHandler = require('./forward-message-handler');

const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
const DeliveredToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/deliveredToArchive.js');
const HoldToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/holdToArchivedForwardMessage.js');
const HoldToPendingForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/holdToPendingForwardMessage.js');
const IndexToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/indexToArchivedForwardMessage.js');
// const PendingFailedToPendingForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pendingFailedToPendingForwardMessage.js'); // deprecated
const PendingToShippedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pendingToShippedForwardMessage.js');
const PickRebillsToBillForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pickRebillsToBill.js');
const RebillToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/rebillToArchivedForwardMessage.js');
const RecoverToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHold.js');
const SendNotificationsToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/sendNotificationsToArchivedForwardMessage.js');
const ShippedToDeliveredForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/shippedToDeliveredForwardMessage.js');

module.exports = {

	billtohold: handleForwardMessage((event) => new BillToHoldForwardMessageController().execute(event)),
	deliveredtoarchive: handleForwardMessage((event) => new DeliveredToArchiveForwardMessageController().execute(event)),
	holdtoarchive: handleForwardMessage((event) => new HoldToArchivedForwardMessageController().execute(event)),
	holdtopending: handleForwardMessage((event) => new HoldToPendingForwardMessageController().execute(event)),
	indextoarchive: handleForwardMessage((event) => new IndexToArchivedForwardMessageController().execute(event)),
	// pendingfailedtopending: handleForwardMessage((event) => new PendingFailedToPendingForwardMessageController().execute(event)), // deprecated
	pendingtoshipped: handleForwardMessage((event) => new PendingToShippedForwardMessageController().execute(event)),
	pickrebillstobill: handleForwardMessage((event) => new PickRebillsToBillForwardMessageController().execute(event)),
	rebilltoarchive: handleForwardMessage((event) => new RebillToArchiveForwardMessageController().execute(event)),
	recovertoarchive: handleForwardMessage((event) => new RecoverToArchiveForwardMessageController().execute(event)),
	recovertohold: handleForwardMessage((event) => new RecoverToHoldForwardMessageController().execute(event)),
	sendnotificationstoarchive: handleForwardMessage((event) => new SendNotificationsToArchiveForwardMessageController().execute(event)),
	shippedtodelivered: handleForwardMessage((event) => new ShippedToDeliveredForwardMessageController().execute(event)),

};

function handleForwardMessage(delegate) {
	return (event, context, callback) => new ForwardMessageHandler().handle(event, context, callback, delegate);
}

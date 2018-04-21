const _ = require('lodash');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const AuthorizationHandler = require('./authorization-handler');
const EndpointHandler = require('./endpoint-handler');
const ForwardMessageHandler = require('./forward-message-handler');
const AnalyticsHandler = require('./analytics-handler');
const ReindexHandler = require('./reindex-handler');
const SnsHandler = require('./sns-handler');

const VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
const VerifySiteJWTController = global.SixCRM.routes.include('controllers', 'authorizers/verifySiteJWT.js');
const VerifyTransactionJWTController = global.SixCRM.routes.include('controllers', 'authorizers/verifyTransactionJWT.js');

const AcquireTokenController = global.SixCRM.routes.include('controllers','endpoints/acquireToken.js');
const CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
const ConfirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');
const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
const GraphController = global.SixCRM.routes.include('controllers', 'endpoints/graph.js');
const InfoController = global.SixCRM.routes.include('controllers', 'endpoints/info.js');
const TrackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
const DeliveredToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/deliveredToArchive.js');
const HoldToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/holdToArchivedForwardMessage.js');
const HoldToPendingForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/holdToPendingForwardMessage.js');
const IndexToArchivedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/indexToArchivedForwardMessage.js');
const PendingFailedToPendingForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pendingFailedToPendingForwardMessage.js');
const PendingToShippedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pendingToShippedForwardMessage.js');
const PickRebillsToBillForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pickRebillsToBillForwardMessage.js');
const RebillToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/rebillToArchiveForwardMessage.js');
const RecoverToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchiveForwardMessage.js');
const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHoldForwardMessage.js');
const SendNotificationsToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/sendNotificationsToArchiveForwardMessage.js');
const ShippedToDeliveredForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/shippedToDeliveredForwardMessage.js');

const AnalyticsEventBroker = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-broker.js');
const EventEmailsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/eventEmails.js');
const NotificationEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/notificationEvents.js');
const TrackingEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/trackingEvents.js');

module.exports = {

	authorizers: {

		verifySignature: handleAuthorization(async (event) => {
			let authority_user = await new VerifySignatureController().execute(event);
			if (_.isObject(authority_user) && _.has(authority_user, 'id')) {
				return { allow: true, response: authority_user.id }
			} else {
				return { allow: false }
			}
		}),

		verifySiteJwt: handleAuthorization(async (event) => {
			let controller = new VerifySiteJWTController();
			let response = await controller.execute(event);
			if(stringutilities.isEmail(response)){
				return { allow: true, response };
			}
			else if (response == controller.messages.bypass) {
				return { allow: true, response: null };
			}
			else {
				return { allow: false }
			}
		}),

		verifyTransactionJwt: handleAuthorization(async (event) => {
			let response = await new VerifyTransactionJWTController().execute(event);
			if (_.isString(response)) {
				return { allow: true, response }
			} else {
				return { allow: false }
			}
		})

	},

	endpoints: {

		// For TS: Convert to generics e.g. handleEndpoint<AcquireTokenController>
		acquireToken: handleEndpoint((event) => new AcquireTokenController().execute(event)),
		checkout: handleEndpoint((event) => new CheckoutController().execute(event)),
		confirmOrder: handleEndpoint((event) => new ConfirmOrderController().execute(event)),
		createLead: handleEndpoint((event) => new CreateLeadController().execute(event)),
		createOrder: handleEndpoint((event) => new CreateOrderController().execute(event)),
		graph: handleEndpoint((event) => new GraphController().execute(event)),
		info: handleEndpoint((event) => new InfoController().execute(event)),
		tracking: handleEndpoint((event) => new TrackingController().execute(event))

	},

	workers: {

		analytics: handleAnalytics(),

		forwardMessage: {

			billToHold: handleForwardMessage((event) => new BillToHoldForwardMessageController().execute(event)),
			deliveredToArchive: handleForwardMessage((event) => new DeliveredToArchiveForwardMessageController().execute(event)),
			holdToArchived: handleForwardMessage((event) => new HoldToArchivedForwardMessageController().execute(event)),
			holdToPending: handleForwardMessage((event) => new HoldToPendingForwardMessageController().execute(event)),
			indexToArchived: handleForwardMessage((event) => new IndexToArchivedForwardMessageController().execute(event)),
			pendingFailedToPending: handleForwardMessage((event) => new PendingFailedToPendingForwardMessageController().execute(event)),
			pendingToShipped: handleForwardMessage((event) => new PendingToShippedForwardMessageController().execute(event)),
			pickRebillsToBill: handleForwardMessage((event) => new PickRebillsToBillForwardMessageController().execute(event)),
			rebillToArchive: handleForwardMessage((event) => new RebillToArchiveForwardMessageController().execute(event)),
			recoverToArchive: handleForwardMessage((event) => new RecoverToArchiveForwardMessageController().execute(event)),
			recoverToHold: handleForwardMessage((event) => new RecoverToHoldForwardMessageController().execute(event)),
			sendNotificationsToArchive: handleForwardMessage((event) => new SendNotificationsToArchiveForwardMessageController().execute(event)),
			shippedToDelivered: handleForwardMessage((event) => new ShippedToDeliveredForwardMessageController().execute(event)),

		},

		reindex: handleReindex(),

		sns: {

			analyticsEvents: handleSns((event) => new AnalyticsEventBroker().execute(event)),
			customerEmail: handleSns((event) => new EventEmailsController().execute(event)),
			notificationEvents: handleSns((event) => new NotificationEventsController().execute(event)),
			trackingEvents: handleSns((event) => new TrackingEventsController().execute(event))

		}

	}

}

function handleAuthorization(delegate) {
	return (event, context, callback) => new AuthorizationHandler.handle(event, context, callback, delegate);
}

function handleEndpoint(delegate) {
	return (event, context, callback) => new EndpointHandler.handle(event, context, callback, delegate);
}

function handleAnalytics() {
	return (event, context, callback) => new AnalyticsHandler.handle(event, context, callback);
}

function handleForwardMessage(delegate) {
	return (event, context, callback) => new ForwardMessageHandler.handle(event, context, callback, delegate);
}

function handleReindex() {
	return (event, context, callback) => new ReindexHandler.handle(event, context, callback);
}

function handleSns(delegate) {
	return (event, context, callback) => new SnsHandler.handle(event, context, callback, delegate);
}

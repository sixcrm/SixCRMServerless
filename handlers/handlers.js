const _ = require('lodash');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const LoggingHandler = require('./logging-handler');
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
// const PendingFailedToPendingForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pendingFailedToPendingForwardMessage.js'); // deprecated
const PendingToShippedForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pendingToShippedForwardMessage.js');
const PickRebillsToBillForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/pickRebillsToBill.js');
const RebillToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/rebillToArchivedForwardMessage.js');
const RecoverToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToArchivedForwardMessage.js');
const RecoverToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/recoverToHold.js');
const SendNotificationsToArchiveForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/sendNotificationsToArchivedForwardMessage.js');
const ShippedToDeliveredForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/shippedToDeliveredForwardMessage.js');

const AnalyticsEventBroker = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-broker.js');
const EventEmailsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/eventEmails.js');
const NotificationEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/notificationEvents.js');
const TrackingEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/trackingEvents.js');

module.exports = {

	logger: handleLogging(),

	authorizers: {

		verifysignature: handleAuthorization(async (event) => {
			let authority_user = await new VerifySignatureController().execute(event);
			if (_.isObject(authority_user) && _.has(authority_user, 'id')) {
				return { allow: true, response: authority_user.id }
			} else {
				return { allow: false }
			}
		}),

		verifysitejwt: handleAuthorization(async (event) => {
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

		verifytransactionjwt: handleAuthorization(async (event) => {
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
		acquiretoken: handleEndpoint((event) => new AcquireTokenController().execute(event)),
		checkout: handleEndpoint((event) => new CheckoutController().execute(event)),
		confirmorder: handleEndpoint((event) => new ConfirmOrderController().execute(event)),
		createlead: handleEndpoint((event) => new CreateLeadController().execute(event)),
		createorder: handleEndpoint((event) => new CreateOrderController().execute(event)),
		graph: handleEndpoint((event) => new GraphController().execute(event)),
		info: handleEndpoint((event) => new InfoController().execute(event)),
		tracking: handleEndpoint((event) => new TrackingController().execute(event))

	},

	workers: {

		analyticseventhandler: handleAnalytics(),

		forwardMessage: {

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

		},

		reindex: handleReindex(),

		sns: {

			analyticsevents: handleSns((event) => new AnalyticsEventBroker().execute(event)),
			customeremail: handleSns((event) => new EventEmailsController().execute(event)),
			notificationevents: handleSns((event) => new NotificationEventsController().execute(event)),
			trackingevents: handleSns((event) => new TrackingEventsController().execute(event))

		}

	}

}

function handleLogging() {
	return (event, context, callback) => new LoggingHandler().handle(event, context, callback);
}

function handleAuthorization(delegate) {
	return (event, context, callback) => new AuthorizationHandler().handle(event, context, callback, delegate);
}

function handleEndpoint(delegate) {
	return (event, context, callback) => new EndpointHandler().handle(event, context, callback, delegate);
}

function handleAnalytics() {
	return (event, context, callback) => new AnalyticsHandler().handle(event, context, callback);
}

function handleForwardMessage(delegate) {
	return (event, context, callback) => new ForwardMessageHandler().handle(event, context, callback, delegate);
}

function handleReindex() {
	return (event, context, callback) => new ReindexHandler().handle(event, context, callback);
}

function handleSns(delegate) {
	return (event, context, callback) => new SnsHandler().handle(event, context, callback, delegate);
}

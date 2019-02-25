const EndpointHandler = require('./endpoint-handler');

const AcquireTokenController = global.SixCRM.routes.include('controllers','endpoints/acquireToken.js');
const CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
const ConfirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');
const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
const RestoreAccountController = global.SixCRM.routes.include('controllers', 'endpoints/restoreAccount.js');
const ReattemptRebillController = global.SixCRM.routes.include('controllers', 'endpoints/reattemptRebill.js');
const ConfirmSubscriptionController = global.SixCRM.routes.include('controllers', 'endpoints/confirmSubscription.js');
const RetrySubscriptionConfirmationController = global.SixCRM.routes.include('controllers', 'endpoints/retrySubscriptionConfirmation.js');
const GraphController = global.SixCRM.routes.include('controllers', 'endpoints/graph.js');
const PublicGraphController = global.SixCRM.routes.include('controllers', 'endpoints/publicgraph.js');
const CustomerGraphController = global.SixCRM.routes.include('controllers', 'endpoints/customergraph.js');

const InfoController = global.SixCRM.routes.include('controllers', 'endpoints/info.js');
const TrackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

module.exports = {
	// For TS: Convert to generics e.g. handleEndpoint<AcquireTokenController>
	acquiretoken: handleEndpoint((event, context) => new AcquireTokenController().execute(event, context)),
	checkout: handleEndpoint((event, context) => new CheckoutController().execute(event, context)),
	confirmorder: handleEndpoint((event, context) => new ConfirmOrderController().execute(event, context)),
	createlead: handleEndpoint((event, context) => new CreateLeadController().execute(event, context)),
	createorder: handleEndpoint((event, context) => new CreateOrderController().execute(event, context)),
	reattemptrebill: handleEndpoint((event, context) => new ReattemptRebillController().execute(event, context)),
	restoreaccount: handleEndpoint((event, context) => new RestoreAccountController().execute(event, context)),
	confirmsubscription: (event, context, callback) => new ConfirmSubscriptionController().execute(event, context, callback),
	retrysubscriptionconfirmation: (event, context, callback) => new RetrySubscriptionConfirmationController().execute(event, context, callback),
	graph: handleEndpoint((event, context) => new GraphController().execute(event, context)),
	customergraph: handleEndpoint((event, context) => new CustomerGraphController().execute(event, context)),
	info: handleEndpoint((event, context) => new InfoController().execute(event, context)),
	tracking: handleEndpoint((event, context) => new TrackingController().execute(event, context)),
	publicgraph: handleEndpoint((event, context) => new PublicGraphController().execute(event, context))
};

function handleEndpoint(delegate) {
	return (event, context, callback) => new EndpointHandler().handle(event, context, callback, delegate);
}

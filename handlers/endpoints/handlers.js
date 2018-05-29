const EndpointHandler = require('./endpoint-handler');

const AcquireTokenController = global.SixCRM.routes.include('controllers','endpoints/acquireToken.js');
const CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
const ConfirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');
const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
const GraphController = global.SixCRM.routes.include('controllers', 'endpoints/graph.js');
const PublicGraphController = global.SixCRM.routes.include('controllers', 'endpoints/publicgraph.js');
const CustomerGraphController = global.SixCRM.routes.include('controllers', 'endpoints/customergraph.js');

const InfoController = global.SixCRM.routes.include('controllers', 'endpoints/info.js');
const TrackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

module.exports = {
	// For TS: Convert to generics e.g. handleEndpoint<AcquireTokenController>
	acquiretoken: handleEndpoint((event) => new AcquireTokenController().execute(event)),
	checkout: handleEndpoint((event) => new CheckoutController().execute(event)),
	confirmorder: handleEndpoint((event) => new ConfirmOrderController().execute(event)),
	createlead: handleEndpoint((event) => new CreateLeadController().execute(event)),
	createorder: handleEndpoint((event) => new CreateOrderController().execute(event)),
	graph: handleEndpoint((event) => new GraphController().execute(event)),
	customergraph: handleEndpoint((event) => new CustomerGraphController().execute(event)),
	info: handleEndpoint((event) => new InfoController().execute(event)),
	tracking: handleEndpoint((event) => new TrackingController().execute(event)),
	publicgraph: handleEndpoint((event) => new PublicGraphController().execute(event))
};

function handleEndpoint(delegate) {
	return (event, context, callback) => new EndpointHandler().handle(event, context, callback, delegate);
}

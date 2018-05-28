
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;

let shippingReceiptHistoryElementType = require('./elements/historyElementType');
let fulfillmentProviderType = require('../fulfillmentprovider/fulfillmentProviderType');
let shippingReceiptTrackingElementType = require('./elements/trackingElementType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'shippingreceipt',
	description: 'A shipping receipt.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the shipping receipt.',
		},
		status: {
			type: GraphQLString,
			description: 'A shipping status',
		},
		tracking: {
			type: shippingReceiptTrackingElementType.graphObj,
			description: 'Tracking Details for the shipping receipt.',
		},
		fulfillment_provider: {
			type: fulfillmentProviderType.graphObj,
			description:"The fulfillment provider associated with the shipping receipt",
			resolve: (shipping_receipt) => {
				const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
				let shippingReceiptController = new ShippingReceiptController();

				return shippingReceiptController.getFulfillmentProvider(shipping_receipt);
			}
		},
		fulfillment_provider_reference:{
			type: GraphQLString,
			description:  'The fulfillment provider specific identifier that corresponds the the fulfillment order.'
		},
		history:{
			type: new GraphQLList(shippingReceiptHistoryElementType.graphObj),
			description: 'History records corresponding to the shipping receipt.'
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was created.',
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was updated.',
		}
	}),
	interfaces: []
});

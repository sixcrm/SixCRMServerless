
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

const shippingReceiptTrackingInputType = require('./elements/shippingReceiptTrackingInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ShippingReceiptInputType',
	fields: () => ({
		id:					{ type: new GraphQLNonNull(GraphQLString) },
		fulfillment_provider: { type: new GraphQLNonNull(GraphQLString) },
		tracking: {
			type: shippingReceiptTrackingInputType.graphObj,
			description: "Shipping receipt tracking input type"
		},
		status: { type: new GraphQLNonNull(GraphQLString) },
		updated_at: { type: GraphQLString }
	})
});

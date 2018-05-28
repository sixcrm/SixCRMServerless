
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ShippingReceiptTrackingInput',
	fields: () => ({
		id: {
			type: GraphQLString,
			description: 'The tracking ID of the shipping receipt',
		},
		carrier: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The shipping carrier carrier name'
		}
	})
});

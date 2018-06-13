
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'FulfillmentProviderProviderInput',
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the fulfillment provider.',
		},
		api_key: {
			type: GraphQLString,
			description: 'The fulfillment provider instance api_key.',
		},
		api_secret: {
			type: GraphQLString,
			description: 'The fulfillment provider instance api_secret.',
		},
		username: {
			type: GraphQLString,
			description: 'The fulfillment provider instance username.',
		},
		password: {
			type: GraphQLString,
			description: 'The fulfillment provider instance password.',
		},
		threepl_customer_id: {
			type: GraphQLInt,
			description: 'Hashtag (ThreePL) Customer ID.',
		},
		threepl_key: {
			type: GraphQLString,
			description: 'The bracketed ThreePL Key.',
		},
		threepl_id: {
			type: GraphQLInt,
			description: 'The ThreePL ID.',
		},
		threepl_facility_id: {
			type: GraphQLInt,
			description: 'The ThreePL Facility ID.',
		},
		store_id: {
			type: GraphQLInt,
			description: 'ShipStation Store ID',
		}
	})
});

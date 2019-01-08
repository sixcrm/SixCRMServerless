
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'FulfillmentProviderValidation',
	fields: () => ({
		code: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The validation result.'
		},
		vendor_response:{
			type: GraphQLJSON,
			description: 'The vendor response.'
		}
	})
});

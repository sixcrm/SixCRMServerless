
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let providerInputType = require('./elements/providerInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'FulfillmentProviderInput',
	fields: () => ({
		id:					{ type: GraphQLString },
		name:				{ type: new GraphQLNonNull(GraphQLString) },
		provider:		{ type: new GraphQLNonNull(providerInputType.graphObj) },
		updated_at: { type: GraphQLString }
	})
});

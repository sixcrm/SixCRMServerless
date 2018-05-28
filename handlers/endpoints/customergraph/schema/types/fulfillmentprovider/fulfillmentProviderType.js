const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let providerType = require('./providers/providerType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'fulfillmentprovider',
	description: 'A fulfillment provider.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the fulfillment provider instance.',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the fulfillment provider instance.',
		},
		provider: {
			type: new GraphQLNonNull(providerType.graphObj),
			description: 'The provider configuration.',
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

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'shippingreceipthistoryelement',
	description: 'A shipping receipt history element.',
	fields: () => ({
		status: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The observed status of the shipping receipt',
		},
		detail: {
			type: GraphQLString,
			description: 'Details about the observed status',
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was created.',
		}
	}),
	interfaces: []
});

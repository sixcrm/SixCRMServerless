const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'shippingreceipttrackingelement',
	description: 'A shipping receipt tracking element.',
	fields: () => ({
		carrier: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The shipping carrier',
		},
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The shipping carrier id (tracking number)',
		}
	}),
	interfaces: []
});

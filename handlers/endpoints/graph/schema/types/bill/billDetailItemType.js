const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLFloat = require('graphql').GraphQLFloat;

module.exports.graphObj = new GraphQLObjectType({
	name: 'billDetailItem',
	description: 'A bill detail item.',
	fields: () => ({
		description: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The description of the line-item charge.',
		},
		amount: {
			type: new GraphQLNonNull(GraphQLFloat),
			description: 'The amount of the line-item charge.',
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The ISO8601 datetime when the line-item was added to the bill.',
		}
	}),
	interfaces: []
});


const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'queueMessageType',
	description: 'A message in a queue.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ID of a message'
		},
		queue: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ID of a message'
		},
		message: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Content of a message'
		}
	}),
	interfaces: []
});

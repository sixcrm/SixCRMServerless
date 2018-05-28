
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'AlertTest',
	description: 'Send a test alert notification.',
	fields: () => ({
		result: {
			type: GraphQLString,
			description: 'OK',
		}
	}),
	interfaces: []
});

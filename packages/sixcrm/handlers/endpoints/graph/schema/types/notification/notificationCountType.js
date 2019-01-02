
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInt = require('graphql').GraphQLInt;

module.exports.graphObj = new GraphQLObjectType({
	name: 'NotificationCount',
	description: 'Number of unseen notifications.',
	fields: () => ({
		count: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'Number of unseen notifications.',
		}
	}),
	interfaces: []
});

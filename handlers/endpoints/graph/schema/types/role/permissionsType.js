
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'Permissions',
	description: 'A role permissions object.',
	fields: () => ({
		allow: {
			type: new GraphQLList(GraphQLString),
			description: 'A permissions list',
		},
		deny: {
			type: new GraphQLList(GraphQLString),
			description: 'A permissions list',
		}
	}),
	interfaces: []
});

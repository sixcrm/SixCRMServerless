
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'PermissionsInput',
	fields: () => ({
		allow: {type: new GraphQLList(GraphQLString)},
		deny: {type: new GraphQLList(GraphQLString)}
	}),
});

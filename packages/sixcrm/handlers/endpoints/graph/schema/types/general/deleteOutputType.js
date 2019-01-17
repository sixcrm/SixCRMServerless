
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'deleteOutput',
	fields: () => ({
		id:	{ type: GraphQLString },
		entity:	{ type: GraphQLString }
	})
});

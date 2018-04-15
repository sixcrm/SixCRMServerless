
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'dateSearchInputType',
	fields: () => ({
		before: { type: GraphQLString },
		after: { type: GraphQLString }
	})
});

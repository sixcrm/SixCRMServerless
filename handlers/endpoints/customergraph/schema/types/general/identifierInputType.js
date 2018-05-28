
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'IdentifierInputType',
	fields: () => ({
		id:	{ type: new GraphQLNonNull(GraphQLString) }
	})
});

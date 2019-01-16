
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInt = require('graphql').GraphQLInt;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ImageDimensionsInput',
	fields: () => ({
		width: { type: new GraphQLNonNull(GraphQLInt) },
		height: { type: new GraphQLNonNull(GraphQLInt) }
	})
});

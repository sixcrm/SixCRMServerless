
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'SecondaryIdentifierInputType',
	fields: () => ({
		value:  { type: new GraphQLNonNull(GraphQLString) },
		type:   { type: new GraphQLNonNull(GraphQLString) }
	})
});


const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'CustomerNoteInputType',
	fields: () => ({
		id:					{ type: GraphQLString },
		user:				{ type: new GraphQLNonNull(GraphQLString) },
		customer:			{ type: new GraphQLNonNull(GraphQLString) },
		account:			{ type: GraphQLString },
		body:				{ type: new GraphQLNonNull(GraphQLString) },
		updated_at: { type: GraphQLString }
	})
});

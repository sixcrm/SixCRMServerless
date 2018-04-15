
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'UserInviteInput',
	fields: () => ({
		email:		{ type: new GraphQLNonNull(GraphQLString) },
		account:	{ type: new GraphQLNonNull(GraphQLString) },
		role:		{ type: new GraphQLNonNull(GraphQLString) }
	})
});

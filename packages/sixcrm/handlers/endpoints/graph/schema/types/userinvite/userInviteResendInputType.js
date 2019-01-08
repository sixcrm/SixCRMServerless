
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'UserInviteResendInput',
	fields: () => ({
		acl: { type: new GraphQLNonNull(GraphQLString) }
	})
});

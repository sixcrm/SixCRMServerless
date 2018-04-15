
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'UserInvite',
	description: 'A user invite.',
	fields: () => ({
		link: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the user',
		}
	})
});

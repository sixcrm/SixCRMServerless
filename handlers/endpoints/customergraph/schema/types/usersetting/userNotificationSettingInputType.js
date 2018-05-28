
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'UserNotificationSettingInput',
	fields: () => ({
		name:			{ type: new GraphQLNonNull(GraphQLString) },
		receive:		{ type: new GraphQLNonNull(GraphQLBoolean) },
		data:       	{ type: GraphQLString },
	})
});

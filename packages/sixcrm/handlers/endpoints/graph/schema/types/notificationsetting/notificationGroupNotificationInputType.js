const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'NotificationGroupNotificationInput',
	fields: () => ({
		key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Notification key'
		},
		active: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'The notification active status'
		},
		channels:{
			type: new GraphQLList(GraphQLString),
			description: 'The notification channel settings of notification'
		}
	})
});

const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

const notificationGroupNotificationInputType = require('./notificationGroupNotificationInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'NotificationGroupInput',
	fields: () => ({
		key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Notification Group Key'
		},
		display:{
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'Notification Group Display Setting'
		},
		default:{
			type: new GraphQLList(GraphQLString),
			description: 'The default channel settings of notification group'
		},
		notifications:{
			type: new GraphQLList(notificationGroupNotificationInputType.graphObj),
			description: 'Notification Group Notification Settings'
		}
	})
});

const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLList = require('graphql').GraphQLList;

const notificationGroupInputType = require('./notificationGroupInputType')

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'NotificationSettingGroupInput',
	fields: () => ({
		notification_groups: {
			type: new GraphQLList(notificationGroupInputType.graphObj),
			description: 'Notification Setting Groups'
		}
	})
});

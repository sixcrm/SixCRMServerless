const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
let notificationSettingGroupType = require('./notificationSettingGroupType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'NotificationSettingDefault',
	description: 'A notification default object.',
	fields: () => ({
		notification_groups: {
			type: new GraphQLList(notificationSettingGroupType.graphObj),
			description: 'The default notification group.',
		}
	}),
	interfaces: []
});

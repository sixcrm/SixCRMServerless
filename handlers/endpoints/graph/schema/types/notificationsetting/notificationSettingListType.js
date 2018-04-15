const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let notificationSettingType = require('./notificationSettingType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'NotificationSettingList',
	description: 'Notification Settings.',
	fields: () => ({
		notificationsettings: {
			type: new GraphQLList(notificationSettingType.graphObj),
			description: 'Notification Settings.',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});

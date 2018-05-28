
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

module.exports.graphObj = new GraphQLObjectType({
	name: 'UserNotificationSetting',
	description: 'A user setting section for notifications.',
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Notification type name ("email", "sms" etc).',
		},
		receive: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'Whether the user wants to receive such notification.',
		},
		data: {
			type: GraphQLString,
			description: 'Data needed to send the notification (email address, sms number etc).',
		}
	}),
	interfaces: []
});

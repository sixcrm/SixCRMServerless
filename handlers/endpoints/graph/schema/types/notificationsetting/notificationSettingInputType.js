const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

const notificationSettingGroupInputType = require('./notificationSettingGroupInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'NotificationSettingInput',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString)
		},
		settings: {
			type: new GraphQLNonNull(notificationSettingGroupInputType.graphObj)
		},
		updated_at: {
			type: GraphQLString
		}
	})
});

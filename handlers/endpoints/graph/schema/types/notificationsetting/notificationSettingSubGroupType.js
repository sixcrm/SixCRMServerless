const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

module.exports.graphObj = new GraphQLObjectType({
	name: 'NotificationSettingSubGroup',
	description: 'A notification setting subgroup.',
	fields: () => ({
		key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The notifcation key.'
		},
		active:{
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'The notification active status'
		},
		channels: {
			type: new GraphQLList(GraphQLString),
			description: 'The notification channel settings'
		}
	}),
	interfaces: []
});

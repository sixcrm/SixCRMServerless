
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let notificationType = require('./notificationType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj =  new GraphQLObjectType({
	name: 'NotificationList',
	description: 'Notifications.',
	fields: () => ({
		notifications: {
			type: new GraphQLList(notificationType.graphObj),
			description: 'Notifications.',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Pagination',
		}
	}),
	interfaces: []
});


const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let eventHookType = require('./eventHookType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'EventHooks',
	description: 'Event Hooks',
	fields: () => ({
		eventhooks: {
			type: new GraphQLList(eventHookType.graphObj),
			description: 'The fulfillment providers'
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination'
		}
	}),
	interfaces: []
});


const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let trackerType = require('./trackerType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Trackers',
	description: 'Trackers',
	fields: () => ({
		trackers: {
			type: new GraphQLList(trackerType.graphObj),
			description: 'The trackers',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});

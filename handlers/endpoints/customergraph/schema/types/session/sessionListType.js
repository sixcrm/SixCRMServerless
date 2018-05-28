
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let paginationType = require('../pagination/paginationType');
let sessionType = require('./sessionType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Sessions',
	description: 'Sessions',
	fields: () => ({
		sessions: {
			type: new GraphQLList(sessionType.graphObj),
			description: 'The sessions',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});


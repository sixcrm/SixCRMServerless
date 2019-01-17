
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let campaignType = require('./campaignType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Campaigns',
	description: 'Campaigns',
	fields: () => ({
		campaigns: {
			type: new GraphQLList(campaignType.graphObj),
			description: 'The campaigns',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
